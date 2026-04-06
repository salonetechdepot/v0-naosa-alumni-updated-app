-- Seed initial admin user
-- Password: admin123 (bcrypt hashed)
-- Note: Change this password immediately after first login!

INSERT INTO "AdminUser" (
  id,
  email,
  "passwordHash",
  "firstName",
  "lastName",
  role,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@naosa.org',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.aOkFRqpFqGXOYG',
  'Admin',
  'User',
  'super_admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
