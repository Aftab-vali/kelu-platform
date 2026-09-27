delete from admin_users where email = 'naseernothing@gmail.com';
insert into admin_users (email, password_hash, full_name, role) values ('naseernothing@gmail.com', '$2b$12$LgxWF8BKmfDpKx56abuJpOYG8NBpvZpqkgmKG.FHyUyn1cC2h5iYu', 'Naseer', 'super_admin');
