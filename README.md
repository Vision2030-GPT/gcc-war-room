# GCC War Risk Dashboard

Real-time geopolitical risk analysis dashboard for the Gulf Cooperation Council region. Built with React, Tailwind CSS, and the Anthropic Claude API.

![Risk Level 5](https://img.shields.io/badge/Risk_Level-5_EXTREME-red)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)

## Features

- **Dashboard** — Risk gauge with heartbeat animation, local risk assessment, GCC regional risk table, key stats, threat map, supply chain status, strike timeline, escape routes, probability forecast
- **Full Analysis** — 14 expandable sections with traffic light risk indicators, searchable and filterable
- **AI Analyst** — Chat with an AI security analyst about the reports (Claude API powered, with offline fallback)
- **Live Intel** — Web search-powered news feed with signal assessment (Claude API + web search)
- **Emergency** — Contacts, shelter protocol, go-bag checklist, return criteria
- **OSINT Sources** — 50+ Twitter/X accounts across 4 categories with embedded feed previews
- **Multi-language** — 10 languages (EN, AR, HI, UR, TL, BN, ML, FA, FR, ZH) with RTL support
- **Country/City Filter** — 6 GCC countries, 20 cities with localized risk data

## Quick Start

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/gcc-risk-dashboard.git
cd gcc-risk-dashboard
```

### 2. Install

```bash
npm install
```

### 3. Configure API Key (optional)

The dashboard works without an API key (offline mode). For live AI features:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com/)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for production

```bash
npm run build
```

## Deploy to Vercel

### Option A: One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/gcc-risk-dashboard)

### Option B: CLI deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add your API key as environment variable
vercel env add VITE_ANTHROPIC_API_KEY
# Paste your key when prompted

# Redeploy with the env var
vercel --prod
```

### Option C: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Framework: **Vite** (auto-detected)
4. Go to **Settings → Environment Variables**
5. Add `VITE_ANTHROPIC_API_KEY` = your Anthropic API key
6. Click **Deploy**

## Push to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: GCC War Risk Dashboard"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/gcc-risk-dashboard.git
git branch -M main
git push -u origin main
```

## Project Structure

```
gcc-risk-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Main dashboard (all components)
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind + custom styles
├── .env.example         # API key template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## API Features

| Feature | Requires API Key | Fallback |
|---------|-----------------|----------|
| Dashboard | No | Full functionality |
| Full Analysis | No | Full functionality |
| AI Analyst (Offline) | No | Pre-built formatted answers |
| AI Analyst (Live) | Yes | Falls back to offline |
| Live Intel | Yes | Shows error, retry button |
| Emergency | No | Full functionality |
| OSINT Sources | No | Direct links to X/Twitter |

## Data Sources

All risk data is extracted from two research reports dated March 16, 2026. The Live Intel tab can fetch real-time news via the Anthropic API with web search enabled.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ANTHROPIC_API_KEY` | Optional | Anthropic API key for AI Analyst and Live Intel |

## License

MIT
