import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import sanitizeHtml from 'sanitize-html';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

// Logo PNG lida uma vez na inicialização; usada como base64 inline nos emails
let LOGO_BASE64 = '';
try {
  const _lp = path.join(__dirname, '..', '..', 'src', 'assets', 'logodefinitiva.png');
  LOGO_BASE64 = fs.readFileSync(_lp).toString('base64');
} catch { /* logo não encontrada — email usa fallback em texto */ }

// ════════════════════════════════════════════════════════════════════
// VALIDATION & SANITIZATION
// ════════════════════════════════════════════════════════════════════

const FIELD_LIMITS = {
  name:    { min: 3,   max: 100  },
  email:   { min: 6,   max: 254  }, // RFC 5321
  phone:   { min: 10,  max: 11   }, // digits only
  message: { min: 10,  max: 2000 },
} as const;

// Common disposable/throwaway email domains — extend as needed
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'trashmail.com', 'trashmail.me',
  'trashmail.net', 'trashmail.io', 'dispostable.com', 'fakeinbox.com',
  'maildrop.cc', 'spamgourmet.com', 'mytemp.email', '10minutemail.com',
  'tempr.email', 'discard.email', 'getairmail.com', 'spam4.me',
]);

/** Strip all HTML/script tags, trim and Unicode-normalize (NFC) to prevent homoglyph bypass */
function sanitize(value: unknown): string {
  if (typeof value !== 'string') return '';
  return sanitizeHtml(value.trim(), { allowedTags: [], allowedAttributes: {} }).normalize('NFC');
}

/** HTML-encode for safe embedding in email templates — prevents XSS in email clients */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Detect CRLF / email-header-injection attempts */
function containsInjection(s: string): boolean {
  return /[\r\n]/.test(s) || /%0[aAdD]/.test(s);
}

/** RFC-5322-compatible email regex */
function isValidEmail(email: string): boolean {
  if (email.length < FIELD_LIMITS.email.min || email.length > FIELD_LIMITS.email.max) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email);
}

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return DISPOSABLE_DOMAINS.has(domain);
}

function isValidBrazilianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

type ContactPayload = { name: string; email: string; phone: string; message: string };
type ValidationResult = { ok: true; data: ContactPayload } | { ok: false; error: string };

function validatePayload(raw: Record<string, unknown>): ValidationResult {
  // Honeypot: legitimate browsers leave this empty; bots fill it
  const website = typeof raw.website === 'string' ? raw.website : '';
  if (website.length > 0) return { ok: false, error: 'HONEYPOT' };

  const name    = sanitize(raw.name);
  const email   = sanitize(raw.email).toLowerCase();
  const phone   = sanitize(raw.phone);
  const message = sanitize(raw.message);

  // Block header-injection in name and email
  if (containsInjection(name) || containsInjection(email))
    return { ok: false, error: 'Dados inválidos.' };

  if (name.length < FIELD_LIMITS.name.min)       return { ok: false, error: 'Nome inválido. Mínimo 3 caracteres.' };
  if (name.length > FIELD_LIMITS.name.max)       return { ok: false, error: 'Nome muito longo.' };
  if (!isValidEmail(email))                      return { ok: false, error: 'Endereço de email inválido.' };
  if (isDisposableEmail(email))                  return { ok: false, error: 'Email temporário não é aceito.' };
  if (!isValidBrazilianPhone(phone))             return { ok: false, error: 'Telefone inválido. Use (DDD) 9XXXX-XXXX.' };
  if (message.length < FIELD_LIMITS.message.min) return { ok: false, error: 'Mensagem muito curta. Mínimo 10 caracteres.' };
  if (message.length > FIELD_LIMITS.message.max) return { ok: false, error: 'Mensagem muito longa. Máximo 2000 caracteres.' };

  return { ok: true, data: { name, email, phone, message } };
}

// ════════════════════════════════════════════════════════════════════
// PER-EMAIL COOLDOWN — prevents email-bombing via same address
// In production with multiple instances, replace Map with Redis.
// ════════════════════════════════════════════════════════════════════

const COOLDOWN_MS = 5 * 60 * 1000; // 5 min between same-email submissions
const cooldownStore = new Map<string, number>();

// Purge expired entries every 10 min to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [k, ts] of cooldownStore) {
    if (now - ts > COOLDOWN_MS) cooldownStore.delete(k);
  }
}, 10 * 60 * 1000).unref();

function isOnCooldown(email: string): boolean {
  const last = cooldownStore.get(email);
  return !!last && Date.now() - last < COOLDOWN_MS;
}

function setCooldown(email: string): void {
  cooldownStore.set(email, Date.now());
}

// ════════════════════════════════════════════════════════════════════
// SMTP TRANSPORTER — singleton with connection pool
// ════════════════════════════════════════════════════════════════════

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;

    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // true só para 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      // IMPORTANTE:
      requireTLS: port === 587,

      tls: {
        rejectUnauthorized: false,
      },

      pool: true,
      maxConnections: 3,

      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,

      logger: process.env.NODE_ENV !== 'production',
      debug: process.env.NODE_ENV !== 'production',
    });

    _transporter.verify((err, success) => {
      if (err) {
        console.error('SMTP VERIFY ERROR:', err);
      } else {
        console.log('SMTP READY:', success);
      }
    });
  }

  return _transporter;
}

// Live production URL — rootforceusinagem.com.br is not registered/resolving yet;
// override via SITE_URL once the custom domain is live.
const SITE_URL = process.env.SITE_URL ?? 'https://rootforceusinagem.vercel.app';

async function sendContactEmails(data: ContactPayload): Promise<void> {
  const sName    = escapeHtml(data.name);
  const sEmail   = escapeHtml(data.email);
  const sPhone   = escapeHtml(data.phone);
  const sMessage = escapeHtml(data.message).replace(/\n/g, '<br>');
  const ts       = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const t        = getTransporter();

  // Logo: prefere LOGO_URL (URL pública hospedada — melhor compatibilidade com clientes de email),
  // depois base64 inline (bloqueado por alguns clientes), depois fallback em texto.
  // → Defina LOGO_URL no .env com a URL pública da logo (ex: https://seudominio.com.br/logo.png)
  const logoUrl  = process.env.LOGO_URL ?? '';
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="Rootforce Usinagem" width="160" style="display:block;border:0;outline:none;max-height:60px;">`
    : LOGO_BASE64
      ? `<img src="data:image/png;base64,${LOGO_BASE64}" alt="Rootforce Usinagem" width="160" style="display:block;border:0;outline:none;max-height:60px;">`
      : `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="font-size:20px;font-weight:900;letter-spacing:5px;color:#D4AF37;text-transform:uppercase;font-family:Arial,sans-serif;">ROOTFORCE</td></tr><tr><td style="font-size:9px;letter-spacing:4px;color:rgba(212,175,55,0.6);text-transform:uppercase;font-family:Arial,sans-serif;padding-top:4px;">USINAGEM</td></tr></table>`;

  // ── EMAIL 1: Internal — company receives lead ─────────────────────────────────
  await t.sendMail({
    from:    `"Site Rootforce" <${process.env.SMTP_USER}>`,
    to:      process.env.COMPANY_EMAIL ?? 'producao@rootforceusinagem.com.br',
    subject: `[Lead] Novo contato: ${data.name}`,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light"><!--[if mso]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<title>Novo contato recebido</title>
<style>body,html{margin:0;padding:0;background:#050505;}@media only screen and (max-width:740px){.ew{width:100%!important;}.ep{padding:28px 22px!important;}}</style>
</head>
<body style="margin:0;padding:0;background-color:#050505;color:#ffffff;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#050505" style="background-color:#050505;"><tr><td align="center" style="padding:40px 24px;">
<!-- Container -->
<table role="presentation" class="ew" cellspacing="0" cellpadding="0" border="0" width="720" style="max-width:720px;width:100%;background-color:#090909;border-radius:16px;overflow:hidden;">
<!-- Gold line top -->
<tr><td height="3" style="background:linear-gradient(90deg,#050505 0%,#B8960C 15%,#D4AF37 45%,#F0D060 60%,#D4AF37 75%,#B8960C 88%,#050505 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
<!-- Header -->
<tr><td style="padding:30px 40px 26px;background-color:#070707;border-bottom:1px solid rgba(212,175,55,0.1);">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr>
    <td style="vertical-align:middle;">${logoHtml}</td>
    <td align="right" style="vertical-align:middle;"><span style="display:inline-block;background:rgba(212,175,55,0.07);border:1px solid rgba(212,175,55,0.35);border-radius:20px;padding:5px 14px;font-size:10px;font-weight:700;letter-spacing:2px;color:#D4AF37;text-transform:uppercase;font-family:Arial,sans-serif;">&#9679;&nbsp;NOVO LEAD</span></td>
  </tr></table>
</td></tr>
<!-- Title -->
<tr><td class="ep" style="padding:34px 40px 22px;background-color:#070707;">
  <h1 style="margin:0 0 8px;font-size:23px;font-weight:700;color:#FFFFFF;font-family:Arial,sans-serif;line-height:1.3;">Novo contato recebido</h1>
  <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.38);font-family:Arial,sans-serif;line-height:1.5;">Um novo cliente entrou em contato pelo site institucional.</p>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="50%" style="margin-top:22px;"><tr><td height="1" style="background:linear-gradient(90deg,rgba(212,175,55,0.55),rgba(212,175,55,0));font-size:0;">&nbsp;</td></tr></table>
</td></tr>
<!-- Data -->
<tr><td class="ep" style="padding:6px 40px 12px;background-color:#070707;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;"><tr><td style="padding:15px 18px;background-color:#0D0D0D;border-radius:10px;border-left:3px solid rgba(212,175,55,0.5);">
    <p style="margin:0 0 3px;font-size:9px;font-weight:700;color:rgba(212,175,55,0.65);text-transform:uppercase;letter-spacing:1.8px;font-family:Arial,sans-serif;">Nome</p>
    <p style="margin:0;font-size:15px;font-weight:600;color:#FFFFFF;font-family:Arial,sans-serif;">${sName}</p>
  </td></tr></table>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;"><tr><td style="padding:15px 18px;background-color:#0D0D0D;border-radius:10px;border-left:3px solid rgba(212,175,55,0.5);">
    <p style="margin:0 0 3px;font-size:9px;font-weight:700;color:rgba(212,175,55,0.65);text-transform:uppercase;letter-spacing:1.8px;font-family:Arial,sans-serif;">E-mail</p>
    <p style="margin:0;font-size:15px;font-weight:600;color:#D4AF37;font-family:Arial,sans-serif;">${sEmail}</p>
  </td></tr></table>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;"><tr><td style="padding:15px 18px;background-color:#0D0D0D;border-radius:10px;border-left:3px solid rgba(212,175,55,0.5);">
    <p style="margin:0 0 3px;font-size:9px;font-weight:700;color:rgba(212,175,55,0.65);text-transform:uppercase;letter-spacing:1.8px;font-family:Arial,sans-serif;">Telefone</p>
    <p style="margin:0;font-size:15px;font-weight:600;color:#FFFFFF;font-family:Arial,sans-serif;">${sPhone}</p>
  </td></tr></table>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:26px;"><tr><td style="padding:11px 18px;background-color:#090909;border-radius:10px;border:1px solid rgba(212,175,55,0.08);">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);font-family:Arial,sans-serif;">Recebido em:&nbsp;<span style="color:rgba(212,175,55,0.55);">${ts}</span></p>
  </td></tr></table>
</td></tr>
<!-- Message label -->
<tr><td style="padding:0 40px 11px;background-color:#070707;"><p style="margin:0;font-size:9px;font-weight:700;color:rgba(212,175,55,0.6);text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;">Mensagem</p></td></tr>
<!-- Message card -->
<tr><td class="ep" style="padding:0 40px 40px;background-color:#070707;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr>
    <td style="padding:22px 22px 22px 26px;background-color:#0B0B0B;border-radius:12px;border:1px solid rgba(212,175,55,0.14);border-left:4px solid #D4AF37;">
      <p style="margin:0;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.72);font-family:Arial,sans-serif;">${sMessage}</p>
    </td>
  </tr></table>
</td></tr>
<!-- Footer -->
<tr><td style="padding:22px 40px;background-color:#050505;border-top:1px solid rgba(212,175,55,0.07);">
  <p style="margin:0 0 5px;font-size:11px;color:rgba(255,255,255,0.32);font-family:Arial,sans-serif;line-height:1.7;">(41) 98804-1664 &middot; producao@rootforceusinagem.com.br &middot; rootforceusinagem.com.br</p>
  <p style="margin:0;font-size:10px;color:rgba(212,175,55,0.35);font-family:Arial,sans-serif;font-style:italic;">Precis&atilde;o que transforma sua ind&uacute;stria</p>
</td></tr>
<!-- Gold line bottom -->
<tr><td height="3" style="background:linear-gradient(90deg,#050505 0%,#B8960C 15%,#D4AF37 45%,#F0D060 60%,#D4AF37 75%,#B8960C 88%,#050505 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
</table></td></tr></table>
</body></html>`,
  });

  // ── EMAIL 2: Confirmation — client receives ─────────────────────────────────
  await t.sendMail({
    from:    `"Rootforce Usinagem" <${process.env.SMTP_USER}>`,
    to:      data.email,
    subject: 'Recebemos sua mensagem — Rootforce Usinagem',
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light"><!--[if mso]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<title>Recebemos sua mensagem — Rootforce Usinagem</title>
<style>body,html{margin:0;padding:0;background:#050505;}@media only screen and (max-width:740px){.ew{width:100%!important;}.ep{padding:28px 22px!important;}.pl{display:block!important;width:100%!important;padding:0 0 10px 0!important;}}</style>
</head>
<body style="margin:0;padding:0;background-color:#050505;color:#ffffff;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#050505" style="background-color:#050505;"><tr><td align="center" style="padding:40px 24px;">
<!-- Container -->
<table role="presentation" class="ew" cellspacing="0" cellpadding="0" border="0" width="720" style="max-width:720px;width:100%;background-color:#090909;border-radius:16px;overflow:hidden;">
<!-- Gold line top -->
<tr><td height="3" style="background:linear-gradient(90deg,#050505 0%,#B8960C 15%,#D4AF37 45%,#F0D060 60%,#D4AF37 75%,#B8960C 88%,#050505 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
<!-- Header with glow -->
<tr><td align="center" style="padding:70px 50px 55px;background-color:#070707;border-bottom:1px solid rgba(212,175,55,0.18);">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
    <td align="center" style="padding:18px 32px;background:linear-gradient(90deg,rgba(212,175,55,0) 0%,rgba(212,175,55,0.08) 50%,rgba(212,175,55,0) 100%);background-color:#0B0B0B;border:1px solid rgba(212,175,55,0.12);border-radius:14px;">
      ${logoHtml}
      <p style="margin:14px 0 0;font-size:9px;letter-spacing:5px;color:rgba(212,175,55,0.6);text-transform:uppercase;font-family:Arial,sans-serif;">USINAGEM DE PRECIS&Atilde;O</p>
    </td>
  </tr></table>
</td></tr>
<!-- Greeting -->
<tr><td class="ep" style="padding:40px 40px 24px;background-color:#070707;">
  <h1 style="margin:0 0 16px;font-size:25px;font-weight:700;color:#FFFFFF;font-family:Arial,sans-serif;line-height:1.25;">Ol&aacute;, ${sName}!</h1>
  <p style="margin:0 0 11px;font-size:14px;color:rgba(255,255,255,0.62);font-family:Arial,sans-serif;line-height:1.75;">Recebemos sua mensagem com sucesso e agradecemos pelo contato com a <strong style="color:rgba(255,255,255,0.82);">Rootforce Usinagem</strong>.</p>
  <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.45);font-family:Arial,sans-serif;line-height:1.75;">Nossa equipe analisar&aacute; sua solicita&ccedil;&atilde;o com aten&ccedil;&atilde;o e retornar&aacute; o mais breve poss&iacute;vel.</p>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:30px;"><tr><td height="1" style="background:linear-gradient(90deg,rgba(212,175,55,0.3),rgba(212,175,55,0));font-size:0;">&nbsp;</td></tr></table>
</td></tr>
<!-- Your message section -->
<tr><td class="ep" style="padding:26px 40px 16px;background-color:#070707;">
  <p style="margin:0 0 14px;font-size:9px;font-weight:700;color:rgba(212,175,55,0.6);text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;">Sua mensagem</p>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr>
    <td style="padding:28px 30px;background-color:#0B0B0B;border-radius:12px;border:1px solid rgba(212,175,55,0.18);min-height:120px;">
      <p style="margin:0 0 10px;font-size:34px;color:rgba(212,175,55,0.22);font-family:Georgia,serif;line-height:1;">&ldquo;</p>
      <p style="margin:0;font-size:15px;line-height:1.9;color:rgba(255,255,255,0.75);font-family:Arial,sans-serif;font-style:italic;">${sMessage}</p>
    </td>
  </tr></table>
</td></tr>
<!-- Separator -->
<tr><td style="padding:22px 40px 18px;background-color:#070707;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td height="1" style="background:linear-gradient(90deg,rgba(212,175,55,0),rgba(212,175,55,0.2),rgba(212,175,55,0));font-size:0;">&nbsp;</td></tr></table></td></tr>
<!-- 3 Pillars -->
<tr><td class="ep" style="padding:4px 40px 30px;background-color:#070707;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr>
    <td class="pl" width="31%" style="vertical-align:top;padding-right:8px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:26px 18px;background-color:#0D0D0D;border-radius:10px;border-top:2px solid rgba(212,175,55,0.55);text-align:center;">
        <p style="margin:0 0 8px;font-size:18px;color:#D4AF37;">&#9670;</p>
        <p style="margin:0 0 5px;font-size:13px;font-weight:700;color:#D4AF37;font-family:Arial,sans-serif;">Qualidade</p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;line-height:1.5;">Em cada detalhe</p>
      </td></tr></table>
    </td>
    <td class="pl" width="31%" style="vertical-align:top;padding-right:4px;padding-left:4px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:26px 18px;background-color:#0D0D0D;border-radius:10px;border-top:2px solid rgba(212,175,55,0.55);text-align:center;">
        <p style="margin:0 0 8px;font-size:18px;color:#D4AF37;">&#9711;</p>
        <p style="margin:0 0 5px;font-size:13px;font-weight:700;color:#D4AF37;font-family:Arial,sans-serif;">Tecnologia</p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;line-height:1.5;">De ponta</p>
      </td></tr></table>
    </td>
    <td class="pl" width="31%" style="vertical-align:top;padding-left:8px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding:26px 18px;background-color:#0D0D0D;border-radius:10px;border-top:2px solid rgba(212,175,55,0.55);text-align:center;">
        <p style="margin:0 0 8px;font-size:18px;color:#D4AF37;">&#9670;</p>
        <p style="margin:0 0 5px;font-size:13px;font-weight:700;color:#D4AF37;font-family:Arial,sans-serif;">Compromisso</p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;line-height:1.5;">e Confian&ccedil;a</p>
      </td></tr></table>
    </td>
  </tr></table>
</td></tr>
<!-- CTA Buttons -->
<tr><td class="ep" align="center" style="padding:6px 40px 36px;background-color:#070707;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"><tr>
    <td style="padding-right:12px;"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://wa.me/5541988041664" style="height:44px;v-text-anchor:middle;width:182px;" arcsize="23%" strokecolor="#1e1e1e" fillcolor="#111"><w:anchorlock/><center style="color:#fff;font-family:Arial;font-size:13px;font-weight:700;">WhatsApp</center></v:roundrect><![endif]--><!--[if !mso]><!--><a href="https://wa.me/5541988041664" target="_blank" style="display:inline-block;padding:15px 26px;background-color:#111111;border:1px solid rgba(37,211,102,0.45);border-radius:10px;color:#FFFFFF;font-size:14px;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;letter-spacing:0.3px;">&#128172; Falar no WhatsApp</a><!--<![endif]--></td>
    <td><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${SITE_URL}" style="height:50px;v-text-anchor:middle;width:196px;" arcsize="20%" strokecolor="#D4AF37" fillcolor="#D4AF37"><w:anchorlock/><center style="color:#000;font-family:Arial;font-size:14px;font-weight:700;">Nosso site</center></v:roundrect><![endif]--><!--[if !mso]><!--><a href="${SITE_URL}" target="_blank" style="display:inline-block;padding:15px 26px;background:linear-gradient(135deg,#D4AF37 0%,#B8960C 100%);border-radius:10px;color:#000000;font-size:14px;font-weight:700;font-family:Arial,sans-serif;text-decoration:none;letter-spacing:0.3px;">&#8594; Conhecer nosso site</a><!--<![endif]--></td>
  </tr></table>
</td></tr>
<!-- Signature -->
<tr><td class="ep" style="padding:0 40px 34px;background-color:#070707;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:18px;"><tr><td height="1" style="background:linear-gradient(90deg,rgba(212,175,55,0.22),rgba(212,175,55,0));font-size:0;">&nbsp;</td></tr></table>
  <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;">Atenciosamente,</p>
  <p style="margin:0;font-size:14px;font-weight:700;color:#D4AF37;font-family:Arial,sans-serif;letter-spacing:0.4px;">Equipe Rootforce Usinagem</p>
</td></tr>
<!-- Footer -->
<tr><td style="padding:22px 40px;background-color:#050505;border-top:1px solid rgba(212,175,55,0.07);">
  <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.28);font-family:Arial,sans-serif;line-height:1.7;">R. Belmiro Marques, 25 &mdash; Guatup&ecirc;, S&atilde;o Jos&eacute; dos Pinhais &ndash; PR</p>
  <p style="margin:0 0 10px;font-size:11px;color:rgba(255,255,255,0.28);font-family:Arial,sans-serif;line-height:1.7;">(41) 98804-1664 &middot; producao@rootforceusinagem.com.br</p>
  <p style="margin:0;font-size:10px;color:rgba(212,175,55,0.33);font-family:Arial,sans-serif;font-style:italic;">Precis&atilde;o que transforma sua ind&uacute;stria</p>
</td></tr>
<!-- Gold line bottom -->
<tr><td height="3" style="background:linear-gradient(90deg,#050505 0%,#B8960C 15%,#D4AF37 45%,#F0D060 60%,#D4AF37 75%,#B8960C 88%,#050505 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
</table></td></tr></table>
</body></html>`,
  });
}

// ════════════════════════════════════════════════════════════════════
// EXPRESS APP
// ════════════════════════════════════════════════════════════════════

const app = express();

// Trust reverse-proxy IPs (Nginx / Cloudflare) so req.ip is accurate
app.set('trust proxy', 1);

// ── Request ID ── attaches UUID to every request for log correlation ─
app.use((req: Request, res: Response, next: NextFunction) => {
  const id = crypto.randomUUID();
  (req as Request & { reqId: string }).reqId = id;
  res.setHeader('X-Request-ID', id);
  next();
});

// ── Structured logger ── JSON per line, masked IP, never logs body ───
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const id  = (req as Request & { reqId?: string }).reqId ?? '-';
    const raw = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const ip  = raw.replace(/(\d{1,3})$/, '***').replace(/([0-9a-f]{1,4})$/i, '***');
    process.stdout.write(
      JSON.stringify({ t: new Date().toISOString(), id, method: req.method,
        path: req.path, status: res.statusCode, ms: Date.now() - start, ip }) + '\n',
    );
  });
  next();
});

// ── Helmet ── sets X-Frame-Options, X-Content-Type-Options, HSTS, etc.
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// ── CORS ── origin required in production; dev allows no-origin (Postman) ──
// Scoped to /api/contato only — /api/health must stay reachable without an
// Origin header so uptime monitors (and Render's own health checks) don't 500.
const allowedOrigins = (process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use('/api/contato', cors({
  origin: (origin, cb) => {
    if (!origin) {
      if (process.env.NODE_ENV === 'production') { cb(new Error('Origin required')); return; }
      cb(null, true); return;
    }
    if (allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('CORS: origin not allowed'));
    }
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
}));

// ── Body size hard cap ── blocks oversized-payload attacks ───────────
app.use(express.json({ limit: '16kb' }));

// ── Content-Type guard ── rejects non-JSON POST (blocks form smuggling)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    res.status(415).json({ error: 'Content-Type deve ser application/json.' });
    return;
  }
  next();
});

// ── Global rate limit: 60 req / IP / min ─────────────────────────────
app.use(rateLimit({
  windowMs: 60_000, max: 60,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
  skip: (req) => req.path === '/api/health',
}));

// ── /api/contato: progressive slowdown THEN hard cap ─────────────────
// Reqs 1-2: instant → req 3+: +500ms each (max 5s) → hard block at 5 req/min
const contactSlowDown = slowDown({
  windowMs: 60_000,
  delayAfter: 2,
  delayMs: (used: number) => (used - 2) * 500,
  maxDelayMs: 5000,
});

const contactLimiter = rateLimit({
  windowMs: 60_000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' },
});

// ── Rota POST /api/contato ────────────────────────────────────────────

app.post('/api/contato', contactSlowDown, contactLimiter, async (req: Request, res: Response) => {
  const body  = req.body as Record<string, unknown>;
  const reqId = (req as Request & { reqId?: string }).reqId ?? '-';

  const result = validatePayload(body);

  if (!result.ok) {
    if (result.error === 'HONEYPOT') {
      // Silent success — never reveal honeypot detection to bots
      process.stdout.write(JSON.stringify({ t: new Date().toISOString(), event: 'honeypot_hit', id: reqId }) + '\n');
      res.json({ success: true });
      return;
    }
    res.status(400).json({ error: result.error });
    return;
  }

  const { data } = result;

  // Per-email cooldown — prevents flooding via same address
  if (isOnCooldown(data.email)) {
    process.stdout.write(JSON.stringify({ t: new Date().toISOString(), event: 'cooldown_block', id: reqId }) + '\n');
    res.status(429).json({ error: 'Aguarde alguns minutos antes de enviar outra mensagem.' });
    return;
  }

  try {
    await sendContactEmails(data);
    setCooldown(data.email);
    process.stdout.write(JSON.stringify({ t: new Date().toISOString(), event: 'contact_sent', id: reqId }) + '\n');
    res.json({ success: true });
  } catch {
    // Never expose SMTP errors or stack traces to the client
    process.stderr.write(JSON.stringify({ t: new Date().toISOString(), event: 'smtp_error', id: reqId }) + '\n');
    res.status(500).json({ error: 'Falha ao enviar mensagem. Tente novamente mais tarde.' });
  }
});

// ── Healthcheck ───────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// ── 404 ───────────────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found.' });
});

// ── Global error handler ── never leaks stack traces ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  process.stderr.write(`Unhandled: ${err.message}\n`);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  process.stdout.write(JSON.stringify({ t: new Date().toISOString(), event: 'server_start', port: PORT }) + '\n');
});
