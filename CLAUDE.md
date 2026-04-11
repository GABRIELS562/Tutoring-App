# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Warning

This project uses **Next.js 16** which has breaking changes from earlier versions. APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
# Development
npm run dev              # Start dev server (webpack mode)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database (Drizzle ORM + PostgreSQL)
npm run db:generate      # Generate migrations from schema
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio GUI
npm run db:seed-papers   # Seed past papers data
npm run db:seed-questions # Seed questions data
```

## Architecture

### Route Groups (Next.js App Router)

The app uses route groups for layout separation:

- `src/app/(app)/` - Main authenticated app (dashboard, topics, papers, progress, ai-skills)
- `src/app/(admin)/` - Admin panel (topics/questions management)
- `src/app/(auth)/` - Auth pages (login, signup)
- `src/app/api/` - API routes

### Authentication Flow

- **Supabase SSR** handles auth via middleware (`src/middleware.ts`)
- Protected routes: `/dashboard`, `/subjects`, `/topics`, `/papers`, `/progress`, `/admin`
- When Supabase env vars are missing, the app runs in **demo mode** with a mock user
- User data flows via `UserContext` from server layout to client components

### Database Schema (`src/db/schema.ts`)

Key tables:
- `users` - Student profiles with XP, streaks, hearts, AI module progress
- `topics` - CAPS curriculum topics (maths/science, grades 10-12)
- `questions` / `question_options` / `steps` - Quiz question system
- `student_progress` - Per-question progress tracking
- `past_papers` - NSC exam paper references
- `ai_certificates` / `prompt_challenge_attempts` - AI literacy module tracking

### Content Structure

Static curriculum content lives in `src/content/`:
- `maths/grade{10,11,12}/` - Math topics by grade
- `science/grade{10,11,12}/` - Physical Science topics
- `ai-skills/` - AI literacy modules
- `formulas.ts` - Formula sheet data

### Key Integrations

- **PWA**: Configured in `next.config.ts` with workbox caching strategies
- **i18n**: `next-intl` with messages in `src/messages/{en,af}.json`
- **Math rendering**: KaTeX via `react-katex` (see `src/components/math/`)
- **PDF viewing**: `react-pdf` for past papers

### Environment Variables

Required for full functionality:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase auth
- `ANTHROPIC_API_KEY` - AI hint generation (optional)
