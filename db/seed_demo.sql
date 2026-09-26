-- DEMO / TEST DATA ONLY — remove before production.
-- Safe to run repeatedly in a dev/staging database.

insert into districts (name) values
 ('Kalaburagi'),('Bidar'),('Raichur'),('Yadgir'),('Koppal'),('Ballari')
on conflict do nothing;

insert into taluks (district_id, name)
select id, t.taluk from districts d
cross join lateral (values ('Taluk HQ'),('Taluk North'),('Taluk South')) as t(taluk)
where d.name in ('Kalaburagi','Bidar')
on conflict do nothing;

insert into institutions (category, level) values
 ('government','primary'),('government','secondary'),
 ('aided','primary'),('private','higher_education'),('other','secondary')
on conflict do nothing;

insert into issue_categories (name, sort_order) values
 ('Recruitment',1),('Teacher vacancies',2),('Transfers',3),('Promotions',4),
 ('Salary/payment',5),('Pension/retirement',6),('Workload',7),
 ('Non-teaching duties',8),('Administrative procedures',9),('Teacher shortage',10),
 ('Infrastructure',11),('Digital resources',12),('Training & professional development',13),
 ('Student-related challenges',14),('Examination-related responsibilities',15),
 ('Work-life balance',16),('Institutional issues',17),('Other',18)
on conflict do nothing;

-- DEMO / TEST DATA: candidate placeholder (unpublished by default)
insert into candidate_profiles (is_published) values (false);

-- DEMO / TEST DATA: first Super Administrator placeholder.
-- Replace password_hash by actually registering through your auth provider —
-- do NOT ship this literal row to production.
-- insert into admin_users (email, password_hash, full_name, role)
-- values ('admin@example.org', '<bcrypt-hash-here>', 'Super Admin', 'super_admin');
