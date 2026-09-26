# Kelu — Teachers' Voice & Public Feedback Platform

**Kelu** (ಕೇಳು — "Listen") is a two-portal platform for North-East Karnataka's Teachers'
Constituency: a public portal where teachers complete a survey, report issues and leave
suggestions, and **Kelu Insights**, a private admin/analytics portal, both backed by one
shared, access-controlled database.

> **Status: functioning starter codebase, not yet deployed.** This repo is built and
> structured to deploy in under an hour once you connect a database + hosting provider —
> see "What's left to do" below. It has not been given real infrastructure, so there is
> no live URL yet.

## Architecture

```
Teacher → Public Portal (React) ─┐
                                  ├─→ Backend API (Express, Node) → PostgreSQL (single DB)
Admin  → Kelu Insights (React)  ─┘
```

- **frontend-public/** — the public "Kelu" portal (Home, Survey, Report an Issue,
  Suggestion, Candidate, Updates, About, Privacy, Contact). React + Vite + Tailwind,
  trilingual (Kannada / English / Hindi).
- **frontend-admin/** — "Kelu Insights", the private admin/analytics portal. Separate app,
  separate deploy target/subdomain, requires login.
- **backend/** — one Express API used by both frontends. All database access goes through
  here; neither frontend ever talks to Postgres directly.
- **db/migrations/** — the full schema (SQL). Run these against Postgres (Supabase or any
  managed Postgres) to create every table from Section 8/21 of the spec.

## Why one backend, two frontends

Both portals call the same API and read/write the same tables. Public endpoints (survey,
issue, suggestion submission) are unauthenticated but strictly validated and rate-limited.
Every admin endpoint requires a JWT session **and** a server-side role check
(`middleware/requireRole.js`) — the frontend never enforces authorization by itself.

## Local setup

```bash
# 1. Database
createdb kelu               # or create a Postgres project on Supabase/Neon/RDS
psql $DATABASE_URL -f db/migrations/001_init.sql
psql $DATABASE_URL -f db/seed_demo.sql     # optional demo/test data — remove before prod

# 2. Backend
cd backend && cp .env.example .env         # fill in DATABASE_URL and a real JWT_SECRET
npm install
npm run dev                                 # http://localhost:4000

# 3. Public portal
cd ../frontend-public && cp .env.example .env
npm install && npm run dev                  # http://localhost:5173

# 4. Admin portal
cd ../frontend-admin && cp .env.example .env
npm install && npm run dev                  # http://localhost:5174
```

## Creating the first Super Administrator

There is deliberately no public "sign up as admin" endpoint. Create the first admin
directly against the database once, using a real bcrypt hash:

```bash
node -e "require('bcrypt').hash('YourStrongPassword!', 12).then(console.log)"
# then:
psql $DATABASE_URL -c "insert into admin_users (email, password_hash, full_name, role)
  values ('you@yourorg.org', '<paste the hash>', 'Your Name', 'super_admin');"
```

Every subsequent admin user should be created **by an existing Super Administrator**
through a future "manage users" screen (the `admin_users` table and role check are already
in place — the CRUD screen is one of the items in "What's left to do").

## Roles (server-enforced, see `requireRole`)

| Role | Access |
|---|---|
| `super_admin` | everything |
| `data_admin` | survey/issue management, status changes, exports |
| `analytics_user` | dashboard, reports (read-only) |
| `content_admin` | candidate profile, updates/CMS |
| `moderator` | suggestion moderation queue |

## Security notes

- Passwords are hashed with bcrypt (cost 12); the API never returns password hashes.
- JWT sessions expire after 8h; `JWT_SECRET` must be a long random value, set only via
  environment variable.
- `helmet`, CORS allow-list, and rate limiting are enabled in `backend/src/index.js`.
- Every status change, moderation decision, candidate edit and data export is written to
  `audit_logs`.
- Contact info (name/phone/email) lives in its own `contacts` table, referenced by a
  nullable foreign key — survey/issue content can be analyzed without ever joining
  identity data unless a role that's allowed to see it does so deliberately.
- `db/migrations/001_init.sql` enables Row Level Security on every sensitive table. If you
  host on Supabase, keep the browser using the anon key with **no** table grants — all
  public writes go through this Express API (or Supabase Edge Functions, if you port the
  routes), never directly from the browser to Postgres.
- Public GET endpoints (`/candidate`, `/updates`) only ever return **published** content —
  never draft/internal fields.
- The public API intentionally has **no endpoint that returns survey counts, response
  rows, or issue lists** — that data model boundary is enforced in code, not just in the
  frontend.

## Deploying (what you'll need to connect)

Nothing here is deployed yet — that requires accounts/credentials this environment doesn't
have. Recommended path:

1. **Database**: create a Supabase (or Neon/RDS) Postgres project, run the migration.
2. **Backend**: deploy `backend/` to Render/Fly.io/Railway; set the env vars from
   `.env.example` using real values there (never commit them).
3. **Public portal**: deploy `frontend-public/` (static Vite build) to Vercel/Netlify/Cloudflare
   Pages at e.g. `teachers.yourdomain.com`; set `VITE_API_BASE` to your backend's URL.
4. **Admin portal**: deploy `frontend-admin/` the same way at a **separate** subdomain, e.g.
   `admin.yourdomain.com`, with `robots: noindex` (already set in `index.html`).
5. Point `/survey` at the public portal's `/survey` route and generate its QR code from
   that final URL (any QR generator; the route itself needs no extra work).

## What's left to do before this is "production ready"

- [ ] Legal/privacy review of the consent and Privacy-page wording (marked in code).
- [ ] Full district/taluk reference data for all constituency districts (demo seed only
      includes two, as an example).
- [ ] Admin "manage users" screen (table + role check exist; UI doesn't yet).
- [ ] File/photo upload handling for candidate documents and update attachments.
- [ ] i18n coverage for every remaining string (About/Contact/Updates pages currently
      English-only; the architecture already supports adding `kn`/`hi` keys for them).
- [ ] Real hosting, domain, and the deployment steps above.
- [ ] A security audit against a hosted, non-demo database before real teachers use it.

## Demo/test data

`db/seed_demo.sql` is explicitly marked DEMO/TEST DATA and inserts only reference lookups
(districts, categories) plus an unpublished candidate placeholder — no fabricated teacher
responses or fake statistics, per the spec's requirement.
