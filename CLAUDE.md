# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Warning

This project uses **Next.js 16** which has breaking changes from earlier versions. APIs, conventions, and file structure may differ from training data. Heed deprecation notices.

## Commands

```bash
# Development
npm run dev              # Start dev server (webpack mode, port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint (flat config)

# Database (Drizzle ORM + PostgreSQL)
npm run db:generate      # Generate migrations from schema
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio GUI
npm run db:seed-papers   # Seed past papers data
npm run db:seed-questions # Seed questions data
tsx src/db/seed-topics.ts # Seed curriculum topics (no npm script)
```

No test framework is configured.

## Architecture

### Route Groups (Next.js App Router)

- `src/app/(app)/` - Main authenticated app (dashboard, topics, papers, progress, ai-skills, subjects, formulas)
- `src/app/(admin)/` - Admin panel (topics/questions management)
- `src/app/(auth)/` - Auth pages (login, signup)
- `src/app/api/` - API routes (admin, ai-hint, ai-skills, update-grade, verify)

### Authentication Flow

- **Supabase SSR** handles auth via middleware (`src/middleware.ts`)
- Protected routes: `/dashboard`, `/subjects`, `/topics`, `/papers`, `/progress`, `/admin`
- When Supabase env vars are missing, the app runs in **demo mode** with a mock user
- User data flows via `UserContext` (`src/context/UserContext.tsx`) from server layout to client components
- Access user in client components with `useUser()` hook

### Database

**Schema**: `src/db/schema.ts` (Drizzle ORM + PostgreSQL)

Key tables:
- `users` - Student profiles with XP, streaks, hearts, AI module progress
- `topics` - CAPS curriculum topics (maths/science, grades 10-12)
- `questions` / `question_options` / `steps` - Quiz question system
- `student_progress` - Per-question progress tracking
- `past_papers` - NSC exam paper references
- `ai_certificates` / `prompt_challenge_attempts` - AI literacy module tracking

**Queries**: Organized in `src/db/queries/` by domain (users.ts, topics.ts, questions.ts, progress.ts, admin.ts)

**Demo mode**: When `DATABASE_URL` is not set, `src/db/index.ts` exports a mock db that throws helpful errors.

### Content Structure

Static curriculum content in `src/content/`:
- `maths/grade{10,11,12}/` - Math topics by grade
- `science/grade{10,11,12}/` - Physical Science topics
- `ai-skills/` - 5 AI literacy modules
- `formulas.ts` - Formula sheet data

Content exports `TopicContent` objects (see `src/types/index.ts` for type definitions).

### Components

- **UI Library**: Shadcn UI (base-nova style) - config in `components.json`
- **Icons**: Lucide React
- **Path aliases**: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`

Key component directories:
- `src/components/ui/` - Shadcn primitives
- `src/components/quiz/` - Quiz engine and question cards
- `src/components/math/` - KaTeX formula rendering
- `src/components/ai/` - AI literacy module components

### Key Integrations

- **PWA**: Configured in `next.config.ts` with workbox caching strategies (disabled in dev)
- **i18n**: `next-intl` with messages in `src/messages/{en,af}.json`. Locale stored in cookie (`NEXT_LOCALE`), not URL prefix. Config at `src/i18n/routing.ts`.
- **Math rendering**: KaTeX via `react-katex` (see `src/components/math/MathRenderer.tsx`)
- **PDF viewing**: `react-pdf` for past papers

### Environment Variables

Required for full functionality:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase auth
- `ANTHROPIC_API_KEY` - AI hint generation (optional)
- `RESEND_API_KEY` - Email sending (optional)
