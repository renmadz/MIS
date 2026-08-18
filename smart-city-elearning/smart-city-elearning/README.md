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

## Registration & email confirmation

Registration behavior depends on the Supabase Auth **Confirm email** toggle
(Authentication > Settings > Email Auth):

- **Confirm email OFF** (current configuration): `signUp()` returns a live
  session immediately. The app inserts the user's `public.users` profile row in
  the same step and redirects to `/login`. Registration is usable right away.
- **Confirm email ON**: `signUp()` returns a user but **no session** until the
  user clicks the confirmation link in their email. The registration form
  detects this and shows a "check your email to confirm your account" message
  instead of an error.

> **Important if you enable Confirm email:** the profile row in `public.users` is
> currently created inline during registration, which requires the immediate
> session that only exists when confirmation is OFF. With confirmation ON, that
> insert is intentionally skipped, so a confirmed user would have an `auth.users`
> record but **no `public.users` profile** — and the app's login/dashboard flow
> depends on that profile existing. Turning confirmation ON therefore also
> requires moving profile creation to a post-confirmation step (a database
> trigger on `auth.users`, or an auth-callback route) before the flow works
> end to end. See the `handle_new_user()` stub in `001_initial_schema.sql`.

## Content Workflow

Courses are produced through a review-gated pipeline:

1. **Admin creates the course shell** — title, category, description, and other
   course-level metadata — and **assigns an instructor** to it.
2. **Instructor uploads content** — modules and their materials (PDFs to the
   private `course-materials` bucket, lesson structure, etc.) for the assigned
   course.
3. **Admin reviews and approves** the submitted modules before the course is
   published. Nothing an instructor uploads goes live to learners until an admin
   approves it.

### Prerequisites

- A course's prerequisites are matched **live** against other courses by
  **case-insensitive exact course-title** comparison — there are no stored
  course-to-course links; the relationship is resolved at check time from the
  current catalog.
- Prerequisites are **hard-blocked**: a learner cannot enroll in a course until
  its prerequisite course(s) are satisfied.
- **Already-issued certificates are never revoked retroactively.** If a course
  later gains a new prerequisite, learners who already completed and were issued
  a certificate keep it — the new prerequisite only affects future enrollments.

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
