# agentic-commerce

> AgentShop · Shopper inteligente para Argentina · delphsoft

## Estructura

```
agentic-commerce/
├── frontend/          ← Vite + React (deploya en Vercel)
├── ingester/          ← Python scrapers + scorer (corre en GitHub Actions)
└── .github/workflows/ ← Cron diario 3am AR
```

## Setup

### 1. Supabase
- Crear proyecto nuevo en supabase.com
- Correr `supabase_schema.sql` en el SQL Editor

### 2. Frontend (Vercel)
- Conectar repo en vercel.com
- Agregar env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 3. Ingester (GitHub Actions)
- Settings → Secrets → Actions:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
- Actions → Ingest Products → Run workflow
