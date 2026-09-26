-- Kelu Platform — Initial Schema
-- Postgres. Run against your Supabase/Postgres project.
-- Uses UUIDs everywhere so no sequential/guessable IDs are ever exposed publicly.

create extension if not exists "pgcrypto";

-- ============ REFERENCE / LOOKUP TABLES ============

create table districts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table taluks (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references districts(id),
  name text not null,
  unique(district_id, name)
);

create table institutions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('government','aided','private','other')),
  level text not null check (level in ('primary','secondary','higher_education'))
);

create table issue_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0
);

-- ============ IDENTITY (kept separate from response content) ============

-- Optional contact info a teacher may leave. Never joined to survey_answers
-- in any public-facing query; only accessible to Data Administrator / Super Admin roles.
create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- ============ SURVEY ============

create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  anonymous_token uuid not null default gen_random_uuid(), -- lets a teacher's browser resume, not tied to identity
  district_id uuid references districts(id),
  taluk_id uuid references taluks(id),
  institution_id uuid references institutions(id),
  teaching_experience_years int,
  subject_area text,
  contact_id uuid references contacts(id), -- null unless teacher opted in
  language text not null default 'en' check (language in ('en','kn','hi')),
  submitted_at timestamptz,
  created_at timestamptz default now()
);

-- Free-form + structured answers kept in their own table so the response
-- shell (above) carries no PII and can be freely used for aggregate analysis.
create table survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references survey_responses(id) on delete cascade,
  question_key text not null,   -- e.g. 'challenges_selected', 'priority_top3', 'priority_urgent', 'qual_biggest_change'
  answer_text text,
  answer_json jsonb,
  created_at timestamptz default now()
);
create index idx_survey_answers_response on survey_answers(response_id);
create index idx_survey_answers_question on survey_answers(question_key);

-- ============ ISSUES ============

create table issues (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique, -- human-facing e.g. NEK-2026-00482 (NOT the primary key)
  category_id uuid references issue_categories(id),
  district_id uuid references districts(id),
  taluk_id uuid references taluks(id),
  institution_id uuid references institutions(id),
  description text not null,
  seriousness text check (seriousness in ('low','medium','high','urgent')),
  wants_followup boolean default false,
  contact_id uuid references contacts(id),
  status text not null default 'received'
    check (status in ('received','under_review','documented','followup','response_received','closed')),
  assigned_to uuid, -- references admin_users(id), added via fk below
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_issues_status on issues(status);
create index idx_issues_district on issues(district_id);

create table issue_status_history (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  old_status text,
  new_status text not null,
  note text,
  changed_by uuid, -- references admin_users(id)
  changed_at timestamptz default now()
);

-- ============ SUGGESTIONS ============

create table suggestions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in
    ('education_reform','technology','teacher_welfare','classroom','administration','infrastructure','other')),
  content text not null,
  contact_id uuid references contacts(id),
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected','flagged')),
  created_at timestamptz default now()
);

-- ============ CANDIDATE ============

create table candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  is_published boolean default false,
  full_name text,
  photo_url text,
  professional_background text,
  educational_qualifications text,
  teaching_experience text,
  professional_experience text,
  public_service text,
  professional_contributions text,
  published_statements text,
  documents_json jsonb,
  public_contact text,
  updated_at timestamptz default now()
);

-- ============ UPDATES (CMS) ============

create table updates (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in
    ('announcement','teacher_meeting','consultation','document','public_statement','event','portal_update')),
  title text not null,
  short_description text,
  content text,
  attachments_json jsonb,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ============ ADMIN / AUTH / AUDIT ============

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null, -- never store plaintext; hashed by auth layer (bcrypt/argon2 or Supabase Auth)
  full_name text,
  role text not null check (role in
    ('super_admin','data_admin','analytics_user','content_admin','moderator')),
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table issues add constraint fk_issue_assigned
  foreign key (assigned_to) references admin_users(id);
alter table issue_status_history add constraint fk_history_changed_by
  foreign key (changed_by) references admin_users(id);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references admin_users(id),
  action text not null,          -- e.g. 'ISSUE_STATUS_CHANGE', 'DATA_EXPORT', 'LOGIN'
  entity_type text,               -- e.g. 'issue', 'survey_response'
  entity_id uuid,
  details_json jsonb,
  ip_address text,
  created_at timestamptz default now()
);
create index idx_audit_admin on audit_logs(admin_user_id);
create index idx_audit_created on audit_logs(created_at);

-- ============ ROW LEVEL SECURITY (Supabase) ============
-- Enable RLS on every table; only the backend's service role (server-side)
-- bypasses these, so the browser can NEVER read this data directly.

alter table survey_responses enable row level security;
alter table survey_answers enable row level security;
alter table issues enable row level security;
alter table issue_status_history enable row level security;
alter table suggestions enable row level security;
alter table contacts enable row level security;
alter table audit_logs enable row level security;
alter table admin_users enable row level security;

-- Default: deny all direct client access. All reads/writes go through the
-- backend API (service role key, kept server-side only, never in the browser).
-- Public inserts (survey/issue/suggestion submission) are done via a narrow
-- RPC/edge function that validates input server-side — not a direct table grant.
