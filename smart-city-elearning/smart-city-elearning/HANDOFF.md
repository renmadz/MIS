# Project Handoff — Cagayan Valley Smart City Academy

E-learning platform (Next.js 15 / React 19 / TypeScript / Tailwind / shadcn-ui, Supabase Postgres+Auth+Storage) for DOST Region 02's Smart & Sustainable Communities Program. Live at `https://sscacademy.dost02onedata.com`.

This document is the durable record of project state as of the end of the prerequisite-enforcement work. It does not depend on any assistant memory — everything needed to continue is here or in git history.

---

## Critical operating rules (read first)

1. **Destructive-op check-first (live data).** Before ANY `DELETE`/`TRUNCATE`/overwriting `UPDATE` on live `users`/`courses`/`enrollments`/`certificates`: first run the identical filter as a `SELECT`/`count(*)`, show the exact rows, get explicit confirmation, THEN run the destructive statement. **Exact id/value match only — never `LIKE`/wildcards/substring for destructive ops.** (SELECTs may use patterns to *identify*; deletes must be exact-id.)
2. **Course data is the highest-priority thing never to lose.** User-account loss is recoverable/tolerable; course + course-content (modules/lessons/resources) loss is not. This rule exists because a substring `email LIKE '%or%'` delete once removed a real user (`lacortehavilla@gmail.com`); recovered only because they had no enrollments.
3. **Migrations/RLS/DB DDL:** the assistant cannot reach `pg_catalog`/`information_schema`/SQL-editor/Auth-settings — those are dashboard-only. The user runs migrations and catalog queries and pastes results. The assistant reads/writes only `public`-schema **data** via PostgREST (anon + service-role keys in `.env.local`).
4. **Node `fetch` (undici) is flaky here** — it times out on IPv6 to Supabase on this Windows box. Not a real outage; `curl -m 15` to the same endpoint responds in <1s. Use curl for DB checks when scripts report "fetch failed".
5. **Dev server:** after any `npm run build && npm run start` verification, switch back to `npm run dev` before further edits (don't leave stale `.next` prod artifacts around).

---

## Live schema reality (differs from migration files — confirmed drift)

The live DB was **not** built from `001_initial_schema.sql`. Build new schema against live idioms:

- **No enums for most columns.** `courses.level`, `enrollments.status`, `resources.type`, `lessons.type` are `text` + `CHECK`, not enums. Only `user_status` (users.status) and `enrollment_status` exist as enums, and even `enrollments.status` uses text+check, not the enum.
- **UUID default is `uuid_generate_v4()`** (uuid-ossp), not `gen_random_uuid()`.
- **NOT NULL without defaults** on `courses.description/category/thumbnail/instructor/target_audience` — inserts must supply them (else `23502`).
- **FKs are nullable** on `modules.course_id`, `lessons.module_id`, `resources.module_id`, `enrollments.user_id/course_id`. All FKs are `ON DELETE CASCADE`.
- **`courses.rating` = float8**, **`enrollments.grade` = int4** (not the numeric types in `001`).
- **`lessons_type_check` = ('video','text','quiz','assignment')** — **`'pdf'` is NOT valid and never was.**
- **`resources.type` CHECK = ('pdf','video','link','document')**.

### Content model (how PDFs are structured — match this exactly)
A module has **one `resources` row** (`type='pdf'`, `module_id` FK) — the uploaded PDF — plus **lessons rows** (`type='text'`, 100% of the 189 live lessons) that act as section markers, each with a `start_page` into that PDF. Never create a `type='pdf'` lesson. PDFs render client-side via `react-pdf`/pdfjs (see `components/courses/pdf-viewer.tsx`), signed URL fetched directly from Supabase Storage (`course-materials` bucket, 24h expiry) — no third-party proxy.

---

## What's done (all committed on branch `fixing-qa-bugs`)

### Security remediation (was a live, exploitable state)
- **Login auth-bypass** fixed: failed user-type gate now `signOut()`s (was leaving a live session).
- **Middleware** uses `getUser()` (revalidates) not `getSession()` — revoked sessions are now rejected.
- **Certificate IDOR** closed: download route enforces owner-or-admin (403); public verify moved to `GET /api/certificates/verify/[id]` (service-role, returns only name/course/date + valid/revoked/not_found — no grade/PII).
- **RLS audit + fixes (migrations 003/004):** removed out-of-VC dashboard policies that leaked the entire `users` table (PII + `is_admin`) to anon, allowed `is_admin` self-escalation (insert AND update paths), allowed any authenticated user to update any course, and let cert owners tamper/delete their own certs. Also removed the certificate `status='active'` public carve-out (verify now goes through the server route).
- **Registration:** removed dead anon duplicate-email pre-check (rely on `signUp()` error); added "check your email" branch for the confirmation-ON case (see caveat below); fixed org-field wipe on province change.
- **PDF viewer:** replaced Google Docs Viewer iframe (which leaked the private signed URL to Google) with client-side `react-pdf`; fixed the `DOMMatrix` SSR crash via `dynamic(..., { ssr: false })`.

### Migrations (all applied to live AND committed)
| File | Purpose |
|---|---|
| `003_tighten_rls_from_audit.sql` | drop rogue policies; close users PII leak, is_admin escalation, loose course grants, cert tamper |
| `004_tighten_certificate_rls.sql` | remove active-cert public read carve-out (owner/admin only) |
| `005_capture_enrollment_count_trigger.sql` | capture the live `update_enrollment_count` trigger into VC |
| `006` (learningpath_id) | reconcile `learningpath_courses.learningpath_id` naming drift |
| `007_enrollments_unique_user_course.sql` | add missing `UNIQUE(user_id, course_id)` (prevents dup enrollments/double-count) |
| `008_phase3_instructor_content_workflow.sql` | instructor role + workflow (see below) |

### Migration 008 — Phase 3 schema foundation (applied)
- `users.is_instructor` bool + `is_instructor()` helper (mirrors `is_admin()`: sql/STABLE/SECURITY DEFINER/search_path=public).
- `courses.instructor_id` uuid FK → users (ON DELETE SET NULL).
- `modules` review state: `status` text CHECK('draft','pending_review','published','rejected') — existing 23 modules backfilled to `'published'`, default flipped to `'draft'` for new rows — plus `submitted_by`, `reviewed_by`, `reviewed_at`, `review_notes`.
- **Status-aware read RLS** on modules/lessons/resources: non-owner sees only `published` modules of active courses; admin sees all; instructor-owner sees all their own regardless of status. (`resources` enrolled-read also requires enrollment `status IN ('active','completed')`.)
- **Instructor write RLS** (insert/update, no delete): `is_instructor() AND is_active_user() AND course.instructor_id = auth.uid()`. Instructors CANNOT set module status to `published`/`rejected` (WITH CHECK restricts them to draft/pending_review) — only admins publish/reject via the existing `*_admin_write` policies.
- **`get_unmet_prerequisites(p_course_id uuid) returns text[]`** — single source of truth. Uses `auth.uid()` internally. Matches prerequisites (text[] of titles) against live courses by case-insensitive trimmed exact title; returns titles the user hasn't completed; titles with no matching live course are ignored (never block).
- **`suggest_course_titles(text, real)`** + `pg_trgm` — fuzzy "did you mean" for title inputs. Suggestion only, never enforcement.

### Prerequisite enforcement (committed `c878e8a`)
Wired `get_unmet_prerequisites()` into all three points — no duplicated logic:
1. **Enroll** (`course-header.tsx`): re-checks before enrolling, shows unmet titles; distinct "no published content yet" message for zero-published-modules courses.
2. **Course detail** (`app/courses/[id]/page.tsx`): computes unmet prereqs, header shows locked state + disabled "Locked" button.
3. **Module URL** (`app/courses/[id]/module/[moduleId]/page.tsx`): now a **server component** that gates before `ModuleContent` mounts — real enforcement, blocks even a stale/retroactive enrollment row.

---

## What's next (do NOT start without a planning prompt)

1. **Instructor dashboard UI (net-new):** assign-instructor, create module shells, upload PDF (as `resources` type='pdf') + section lessons (type='text' + start_page), submit-for-review, see review status. All RLS is ready; UI does not exist.
2. **Admin review queue (net-new):** approve/reject modules with notes (sets status published/rejected, reviewed_by/at, review_notes). Admin write RLS ready.
3. **Wire `suggest_course_titles()`** into course/prerequisite title inputs as a non-blocking nudge.
4. **Admin management pages are still MOCK data** (original QA finding #3): `course-management.tsx`, `user-management.tsx`, `analytics-dashboard.tsx` render hardcoded arrays; working API routes (`/api/users`, `/api/analytics`, `/api/admin/logs`) exist but are unused. Sidebar advertises 10 routes; only `/admin`, `/admin/users`, `/admin/courses`, `/admin/analytics` exist.
5. **Before building instructor lesson-upload:** dump `lessons` table constraints (only `courses/modules/resources/enrollments` were dumped so far) so the form writes valid values.
6. **Enabling Confirm email** would additionally require: custom SMTP (built-in mailer rate-limits signups into 429) AND moving profile creation to a post-confirmation step (DB trigger/auth-callback) — the inline insert needs the immediate session that only exists when confirmation is off.

---

## Test infrastructure

Reusable Playwright/curl scripts live in the session scratchpad (`.../scratchpad/`), not the repo: `lib-login.js` (shared login helper), `rls-adm.js` (service-role fixtures + exact-id cleanup helpers), and per-feature `test-*.js`. Pattern: create disposable fixtures → assert → clean up by exact id (courses/enrollments require check-first confirmation per rule 1). These are throwaway; re-create as needed.
