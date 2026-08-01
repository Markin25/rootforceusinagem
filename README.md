# Rootforce Usinagem — Site institucional

Site institucional em página única para a Rootforce Usinagem (usinagem CNC de
precisão, São José dos Pinhais — PR). React + TypeScript + Vite no frontend,
com um backend Express dedicado ao formulário de contato.

- **Produção:** https://rootforceusinagem.vercel.app/
- **API de contato:** https://rootforce-api.onrender.com (Render — free tier, pode levar alguns segundos para "acordar" após período sem uso)

## Estrutura do projeto

```
/                       frontend (React + Vite)
  src/
    features/           seções/páginas: home, about, services, estrutura, careers, contact
    components/layout/  Navbar, Footer, RootLayout, SplashScreen
    routes/router.tsx   rotas (site é single-page; rotas antigas redirecionam para âncoras)
    animations/         helpers GSAP
  public/               assets estáticos, robots.txt, sitemap.xml
server/                 backend (Express) — API de contato
  src/index.ts          validação, rate limiting, envio de email via SMTP
```

O site é efetivamente uma única página (`Home.tsx` compõe Hero → Sobre →
Serviços → Estrutura → Carreiras → Contato via scroll por âncora). As rotas
`/servicos`, `/sobre`, `/contato` e `/carreiras` existem apenas como
redirecionamento para a âncora correspondente, para não quebrar links antigos.

## Frontend — como rodar

```sh
npm install
npm run dev
```

Scripts disponíveis:

- `dev` — servidor de desenvolvimento
- `build` — compila para produção (`tsc -b && vite build`)
- `preview` — pré-visualiza o build
- `lint` — verifica lint
- `format` — formata o código com Prettier

Variáveis de ambiente (veja `.env.example`):

- `VITE_API_URL` — URL da API de contato. Sem essa variável, usa o fallback
  fixo apontando para a instância atual no Render.

## Backend (`server/`) — como rodar

```sh
cd server
npm install
npm run dev
```

Scripts: `dev` (tsx watch), `build` (tsc), `start` (node dist/index.js).

Variáveis de ambiente (veja `server/.env.example`): `NODE_ENV`, `PORT`,
`ALLOWED_ORIGIN`, `SITE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, `COMPANY_EMAIL`, `LOGO_URL`.

`ALLOWED_ORIGIN` precisa incluir a URL do frontend em produção
(`https://rootforceusinagem.vercel.app`) — sem isso o formulário de contato
falha por CORS. `/api/health` fica fora do bloqueio de CORS de propósito,
para que serviços de monitoramento/uptime consigam checar o status sem
precisar enviar um header `Origin`.

## SEO

`index.html` inclui título, meta description, Open Graph/Twitter cards,
`robots` e dados estruturados (`LocalBusiness` via JSON-LD). `public/`
contém `robots.txt` e `sitemap.xml` apontando para o domínio de produção.

## Tailwind

Tema escuro com dourado (`#D4AF37`) como cor de destaque, configurado
diretamente nos componentes (classes utilitárias do Tailwind).
