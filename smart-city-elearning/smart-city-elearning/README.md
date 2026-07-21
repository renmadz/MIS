# Cagayan Valley Smart City Academy

E-learning platform for DOST Region 02's Smart and Sustainable Communities Program (SSCP).

## Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend:** Next.js API Routes + Server Components
- **Database / Auth / Storage:** Supabase (PostgreSQL, Auth, Storage)

## Prerequisites

- Node.js 18+
- npm
- A Supabase project with the schema from `supabase/migrations/`

## Local setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase URL, anon key, service role key, and app URL.

3. **Apply database schema**

   If setting up a new Supabase project, run the SQL files in order:

   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

   Optionally run `supabase/seed.sql` for development sample data.

   > **Existing deployments:** If your Supabase project already has tables, review migrations before applying. Use `supabase db diff` or apply RLS policies manually if the schema already exists.

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project structure

```
app/              Pages and API routes (App Router)
components/       React UI components
lib/              Supabase clients, auth helpers, database queries
supabase/         SQL migrations, seed data, schema docs
middleware.ts     Auth session refresh and route protection
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-only) |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL for certificate verification QR codes |

## User roles

- **Guest** — Browse public pages (home, course catalog, learning paths listing)
- **Learner** — Enroll, track progress, earn certificates
- **Admin** — `users.is_admin = true`; access `/admin` routes

## Protected routes

Middleware requires authentication for:

- `/dashboard/*`
- `/courses/*` (course detail and modules; catalog at `/courses` is public)
- `/learning-paths/*` (detail pages; listing is public)
- `/certificates/*`
- `/admin/*`

## API routes

| Route | Auth | Description |
|-------|------|-------------|
| `GET /api/courses` | Public | Active course catalog |
| `GET /api/users` | Admin | List users |
| `GET /api/enrollments` | Self or admin | Enrollments by userId; by courseId requires admin |
| `GET /api/certificates` | Self or admin | Certificates by userId |
| `POST /api/certificates/issue` | Authenticated | Issue certificate after course completion |
| `GET /api/analytics` | Admin | Platform statistics |
| `GET /api/admin/logs` | Admin | Recent admin activity |

## Storage buckets

Create these buckets in Supabase Storage:

- `course-materials` — Module PDF files (private; signed URLs)
- `avatars` — User profile images

## Creating an admin user

After a user registers, promote them in Supabase SQL Editor:

```sql
UPDATE public.users
SET is_admin = true
WHERE email = 'admin@example.com';
```

## Deployment

Production URL: `https://sscacademy.dost02onedata.com`

Build and start:

```bash
npm run build
npm run start
```

Set all environment variables in your hosting provider. Ensure `SUPABASE_SERVICE_ROLE_KEY` is **never** prefixed with `NEXT_PUBLIC_`.

## Documentation

- Schema reference: `supabase/README.md`
- Completion roadmap: see project planning docs in repository discussions

## License

Private — DOST Region 02 (Cagayan Valley).
