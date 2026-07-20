# SmartCV AI — Professional CV & Cover Letter Generator

A full-stack web application for building professional CVs and cover letters with AI-powered enhancements, multiple templates, job matching, and PDF/DOCX export.

## Features

- **CV Builder** — Multi-section form with 3 templates, live preview, photo upload
- **Cover Letter Generator** — 3 letter styles, AI generation or manual fill
- **AI Integration** — OpenAI GPT-4o-mini for CV enhancement and cover letter writing
- **Job Match / ATS Score** — Scans 40+ skill categories against job descriptions
- **Multiple CV Profiles** — Separate profiles for different job applications
- **Export** — PDF (html2pdf.js), DOCX (html-to-docx), Print, JSON backup
- **Dark/Light Theme** — Smooth transitions, fully responsive
- **Keyboard Shortcuts** — Ctrl+Z undo, Ctrl+Y redo, Ctrl+S save

## Architecture

```
Smartcv/
├── src/                    # Frontend ES modules
│   ├── main.js            # Entry point, initialization
│   ├── api.js             # Backend API client
│   ├── auth.js            # Authentication UI & logic
│   ├── store.js           # Data store with undo/redo
│   ├── cv.js              # CV rendering
│   ├── coverLetter.js     # Cover letter rendering
│   ├── export.js          # PDF/DOCX/Print export
│   ├── ai.js              # AI features & job match
│   └── analytics.js       # Analytics tracking
├── server/                 # Express backend
│   ├── index.js           # Server entry point
│   ├── db/                # Supabase setup
│   ├── middleware/         # Auth, rate limiting, tier guard
│   └── routes/            # API routes (auth, AI, payments, user)
├── tests/                  # Vitest unit tests
├── index.html             # Main HTML
├── style.css              # All styles
└── vite.config.js         # Vite config
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES modules) |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL + Auth) |
| Payments | Stripe (subscriptions) |
| AI | OpenAI API (gpt-4o-mini) |
| PDF | html2pdf.js |
| DOCX | html-to-docx |
| Build | Vite |
| Tests | Vitest |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your Supabase, Stripe, and OpenAI keys
```

### 3. Set up database
Paste the SQL from `server/db/setup.js` into your Supabase SQL Editor.

### 4. Run development
```bash
npm run dev          # Both frontend + backend
npm run dev:client   # Frontend only (Vite)
npm run dev:server   # Backend only
```

### 5. Run tests
```bash
npm test
```

### 6. Build for production
```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_PRO_MONTHLY` | Stripe price ID for monthly pro |
| `OPENAI_API_KEY` | OpenAI API key |
| `PORT` | Server port (default: 3000) |
| `CLIENT_URL` | Frontend URL (default: http://localhost:5173) |

## Monetization

### Free Tier
- 1 CV profile
- Basic templates
- Manual cover letter
- PDF export (with watermark)
- 5 AI uses per day
- Basic job match

### Pro Tier ($5/mo or $40/yr)
- Unlimited profiles
- All templates
- AI-enhanced CV & cover letters
- No watermarks
- Cloud save & sync
- Priority support

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/signin` | No | Sign in |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/ai/enhance-cv` | Yes | AI CV enhancement |
| POST | `/api/ai/generate-cover-letter` | Yes | AI cover letter |
| POST | `/api/ai/job-analysis` | Yes | AI job match |
| POST | `/api/payments/create-checkout` | Yes | Create Stripe checkout |
| POST | `/api/payments/webhook` | No | Stripe webhook |
| GET | `/api/payments/status` | Yes | Subscription status |
| PUT | `/api/user/cv-data` | Yes | Save CV data |
| POST | `/api/user/subscribe` | No | Email subscriber |

## License

MIT
