# Baby Feast Diary

Next.js app for baby feeding logs, nutrition summaries, and AI-assisted recommendations.

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`. NICEEEEEEE

## Production DB Safety Checklist

Before running migration/seed on production-like env (`VERCEL_ENV=production|preview`):

1. Confirm `DATABASE_URL` points to the intended project.
2. Take DB backup/snapshot from Supabase.
3. Verify rollback plan (who can restore and ETA).
4. Run safe commands with explicit override:

```bash
ALLOW_PROD_DB_CHANGE=true npm run db:migrate:deploy:safe
ALLOW_PROD_DB_CHANGE=true npm run db:seed:safe
```

Without `ALLOW_PROD_DB_CHANGE=true`, production-like DB commands are blocked.

## AI Heuristic Tuning

The next-food recommendation engine is hybrid (rules + embeddings), and the scoring weights are configurable through environment variables.

Add these to your `.env` file as needed:

```bash
NEXT_FOOD_WEIGHT_CATEGORY_GAP=0.4
NEXT_FOOD_WEIGHT_PREFERENCE=0.3
NEXT_FOOD_WEIGHT_SIMILARITY=0.3
NEXT_FOOD_SIMILARITY_POOL=20
NEXT_FOOD_CUSTOM_WEIGHTS_ENABLED=true
AI_RATE_LIMIT_MAX_REQUESTS=60
AI_RATE_LIMIT_WINDOW_SECONDS=60
AI_RETRY_MAX_ATTEMPTS=3
AI_RETRY_BASE_DELAY_MS=300
DB_POOL_MAX=1
```

Notes:
- The three weight values are normalized automatically.
- `NEXT_FOOD_SIMILARITY_POOL` controls how many embedding-based similar foods are considered before final ranking.
- Set `NEXT_FOOD_CUSTOM_WEIGHTS_ENABLED=false` to force default weights without removing env values.

## Internal Tuning Baseline

For AI tuning metrics and baseline targets, see `docs/ai-tuning-baseline.md`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
