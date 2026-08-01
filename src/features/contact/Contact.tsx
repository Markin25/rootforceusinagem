import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, CheckCircle, MapPin, Phone as PhoneIcon, Mail, Loader2 } from 'lucide-react';
import Section from '@ui/Section';
import Button from '@ui/Button';

gsap.registerPlugin(ScrollTrigger);

type FormState = { name: string; email: string; phone: string; message: string };

// Set VITE_API_URL in the Vercel project (or .env.local for dev) to point at
// wherever the backend is deployed. Falls back to the current Render instance.
const API_URL = import.meta.env.VITE_API_URL ?? 'https://rootforce-api.onrender.com/api/contato';

const contactInfo = [
  {
    Icon: MapPin,
    label: 'Localização',
    value: 'São José dos Pinhais – PR',
  },
  {
    Icon: PhoneIcon,
    label: 'Telefone',
    value: '(41) 98804-1664',
  },
  {
    Icon: Mail,
    label: 'Email',
    value: 'producao@rootforceusinagem.com.br',
  },
];

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: formRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      if (infoRef.current) {
        const items = infoRef.current.querySelectorAll('.contact-item');
        gsap.fromTo(
          items,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: infoRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // 60-second frontend cooldown after successful submission
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const t = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownSeconds]);

  // Phone mask: (41) 99999-9999
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const validate = () => {
    const e: Partial<FormState> = {};
    if (form.name.trim().length < 3) e.name = 'Mínimo 3 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) e.phone = 'Telefone inválido. Use (DDD) 9XXXX-XXXX';
    if (form.message.trim().length < 10) e.message = 'Mínimo 10 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (cooldownSeconds > 0) return;
    if (!validate()) return;
    setSending(true);
    setApiError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Include honeypot field — backend silently rejects if non-empty
        body: JSON.stringify({ ...form, website: honeypotRef.current?.value ?? '' }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setApiError(data.error ?? 'Erro ao enviar mensagem. Tente novamente.');
      } else {
        setSubmitted(true);
        setCooldownSeconds(60); // prevent re-submission for 60s
      }
    } catch {
      setApiError('Não foi possível conectar ao servidor. Verifique sua conexão.');
    } finally {
      setSending(false);
    }
  };

  const onChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'phone' ? formatPhone(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (submitted) {
    return (
      <Section title="Contato" subtitle="Fale conosco">
        <div className="max-w-lg mx-auto">
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Mensagem enviada!</h3>
            <p className="text-gray-400">
              Recebemos sua mensagem e entraremos em contato em breve. Obrigado pelo interesse!
            </p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Contato" subtitle="Envie sua mensagem ou entre em contato diretamente">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
        {/* Form */}
        <form
          ref={formRef}
          className="glass-card rounded-2xl p-8"
          onSubmit={onSubmit}
          noValidate
        >
          <h3 className="text-xl font-semibold text-white mb-6">Envie uma mensagem</h3>
          
          <div className="space-y-5">
            {/* Name */}
            <div className="relative">
              <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focused === 'name' || form.name
                    ? 'text-xs text-[#D4AF37] -top-2.5 bg-gray-900 px-2'
                    : 'text-gray-500 top-3.5'
                }`}
              >
                Nome
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3.5 rounded-xl bg-gray-900/80 border transition-all duration-300 ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500'
                    : focused === 'name'
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                value={form.name}
                onChange={onChange('name')}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                aria-invalid={!!errors.name}
              />
              {errors.name && <span className="text-xs text-red-400 mt-1 block">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="relative">
              <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focused === 'email' || form.email
                    ? 'text-xs text-[#D4AF37] -top-2.5 bg-gray-900 px-2'
                    : 'text-gray-500 top-3.5'
                }`}
              >
                Email
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3.5 rounded-xl bg-gray-900/80 border transition-all duration-300 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : focused === 'email'
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                value={form.email}
                onChange={onChange('email')}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <span className="text-xs text-red-400 mt-1 block">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="relative">
              <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focused === 'phone' || form.phone
                    ? 'text-xs text-[#D4AF37] -top-2.5 bg-gray-900 px-2'
                    : 'text-gray-500 top-3.5'
                }`}
              >
                Telefone
              </label>
              <input
                type="tel"
                className={`w-full px-4 py-3.5 rounded-xl bg-gray-900/80 border transition-all duration-300 ${
                  errors.phone
                    ? 'border-red-500 focus:border-red-500'
                    : focused === 'phone'
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                value={form.phone}
                onChange={onChange('phone')}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <span className="text-xs text-red-400 mt-1 block">{errors.phone}</span>}
            </div>

            {/* Message */}
            <div className="relative">
              <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focused === 'message' || form.message
                    ? 'text-xs text-[#D4AF37] -top-2.5 bg-gray-900 px-2'
                    : 'text-gray-500 top-3.5'
                }`}
              >
                Mensagem
              </label>
              <textarea
                className={`w-full px-4 py-3.5 rounded-xl bg-gray-900/80 border transition-all duration-300 resize-none ${
                  errors.message
                    ? 'border-red-500 focus:border-red-500'
                    : focused === 'message'
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                rows={4}
                value={form.message}
                onChange={onChange('message')}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
                aria-invalid={!!errors.message}
              />
              {errors.message && <span className="text-xs text-red-400 mt-1 block">{errors.message}</span>}
            </div>
          </div>

          {/* Honeypot anti-bot field — must remain empty; bots fill it, humans never see it */}
          <div
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden', opacity: 0 }}
          >
            <label htmlFor="hp-website">Website</label>
            <input
              id="hp-website"
              type="text"
              name="website"
              ref={honeypotRef}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {apiError && (
            <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full mt-6 gap-2"
            disabled={sending || cooldownSeconds > 0}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : cooldownSeconds > 0 ? (
              `Aguarde ${cooldownSeconds}s...`
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar mensagem
              </>
            )}
          </Button>
        </form>

        {/* Contact Info */}
        <div ref={infoRef} className="flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-8">Informações de contato</h3>
          
          <div className="space-y-4">
            {contactInfo.map(({ Icon, label, value}) => (
              <div
                key={label}
                className="contact-item flex items-center gap-4 p-4 rounded-xl bg-gray-900/30 border border-gray-800/50 hover:border-[#D4AF37]/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-white font-medium text-sm">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Maps - Full width below */}
      <div className="mt-12 max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#D4AF37]/10">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Nossa localização</p>
                <p className="text-white font-medium">
                  R. Belmiro Marques, 25 — Guatupê, São José dos Pinhais
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps?q=R.+Belmiro+Marques,+25,+Guatupê,+São+José+dos+Pinhais+-+PR"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#b49328] text-black text-sm font-semibold hover:shadow-lg hover:shadow-[#D4AF37]/25 hover:-translate-y-0.5 transition-all duration-300"
            >
              <MapPin className="w-4 h-4" />
              Ver no Google Maps
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="relative rounded-xl overflow-hidden ring-1 ring-gray-800/50">
            <iframe
              title="Mapa - R. Belmiro Marques, 25"
              src="https://www.google.com/maps?q=R.+Belmiro+Marques,+25,+Guatupê,+São+José+dos+Pinhais+-+PR&output=embed"
              className="w-full h-[280px] lg:h-[320px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
