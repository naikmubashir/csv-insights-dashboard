# CSV Insights Dashboard - Project Specification

## Overview
Upload CSV files, get AI-generated insights, save reports, view history.

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:**  Postgres (Vercel Prisma)
- **LLM:** Gemini API
- **CSV Parsing:** PapaParse
- **Charts:** Recharts (optional for "make it your own")
- **Hosting:** Vercel or Render

## Core Features (Must Have)
1. ✅ Upload CSV file
2. ✅ Preview data in table
3. ✅ Generate insights using AI
4. ✅ Save report to database
5. ✅ View last 5 reports
6. ✅ Export report (copy/download)
7. ✅ Home page with clear instructions
8. ✅ Status page (backend, DB, LLM health)
9. ✅ Error handling

## Extra Features 
- 📊 Simple bar/line chart for numeric columns
- 🎯 Column selection (choose which columns to analyze)
- 💬 Ask follow-up question about the data

## Pages Structure
/                 → Home (landing page)
/upload           → Upload CSV & preview
/report/[id]      → View saved report
/history          → Last 5 reports
/status           → Health checks

## Database Schema
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  row_count INTEGER,
  column_count INTEGER,
  columns_analyzed TEXT[], -- Array of column names
  insights_summary TEXT,
  trends TEXT,
  outliers TEXT,
  recommendations TEXT,
  csv_preview_json JSONB, -- First 10 rows
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Routes
- POST /api/upload       → Handle CSV upload
- POST /api/analyze      → Generate insights with Gemini
- POST /api/reports      → Save report
- GET  /api/reports      → Get last 5 reports
- GET  /api/reports/[id] → Get specific report
- GET  /api/status       → Health check

## File Structure
```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── upload/
│   │   └── page.tsx          # Upload & Preview
│   ├── report/
│   │   └── [id]/
│   │       └── page.tsx      # Report View
│   ├── history/
│   │   └── page.tsx          # History
│   ├── status/
│   │   └── page.tsx          # Status
│   └── api/
│       ├── upload/
│       ├── analyze/
│       ├── reports/
│       └── status/
├── components/
│   ├── CSVUploader.tsx
│   ├── DataPreview.tsx
│   ├── InsightsDisplay.tsx
│   ├── ReportCard.tsx
│   └── StatusCheck.tsx
├── lib/
│   ├── db.ts                 # Database helpers
│   ├── gemini.ts             # GEMINI API wrapper
│   └── csvParser.ts          # CSV parsing utilities
└── types/
    └── index.ts              # TypeScript types
```

