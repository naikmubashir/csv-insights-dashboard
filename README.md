# CSV Insights Dashboard

Upload a CSV file, get AI-powered insights (summary, trends, outliers, recommendations), and save reports — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-AI-blueviolet?logo=google)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

## Features

- **CSV Upload & Preview** — Drag-and-drop CSV files, preview data in a table
- **AI-Generated Insights** — Summary, trends, outliers, and recommendations via Gemini API
- **Column Selection** — Choose specific columns to analyze
- **Interactive Charts** — Bar/line charts for numeric data (Recharts)
- **Follow-Up Chat** — Ask AI follow-up questions about your data
- **Report History** — Save and revisit the last 5 reports
- **Export** — Copy or download reports
- **Health Dashboard** — Backend, database, and LLM status checks

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| AI/LLM | Google Gemini API |
| CSV Parsing | PapaParse |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### Setup

```bash
# Clone
git clone https://github.com/naikmubashir/csv-insights-dashboard.git
cd csv-insights-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your DATABASE_URL and GEMINI_API_KEY to .env

# Run migrations
npx prisma migrate deploy

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
GEMINI_API_KEY=your_gemini_api_key
```
