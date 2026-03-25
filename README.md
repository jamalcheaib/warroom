# غرفة العمليات | War Room

لوحة متابعة العمليات العسكرية اليومية - Arabic-first military operations dashboard.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `/data/operations/` — Daily operation JSON files (YYYY-MM-DD.json)
- `/src/app/api/operations/[date]/` — API route to serve operations by date
- `/src/lib/terminology.ts` — Terminology corrections map
- `/src/components/` — UI components (Header, StatsBar, OperationCard, CategoryFilter)

## Adding Operations

Create a JSON file in `/data/operations/` named `YYYY-MM-DD.json` following the schema in `/src/lib/types.ts`.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS v4
- Noto Kufi Arabic font
- RTL layout
