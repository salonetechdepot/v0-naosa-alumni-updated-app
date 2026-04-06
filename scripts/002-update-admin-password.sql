-- Update admin user with proper bcrypt hash
-- Password: admin123
-- Generated using bcrypt with 10 rounds
UPDATE "AdminUser" 
SET "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.wRPcN.oS6eSTKL.A3W',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "username" = 'admin';

-- If no admin exists, insert one
INSERT INTO "AdminUser" ("id", "username", "passwordHash", "createdAt", "updatedAt")
SELECT 
    'admin-default-001',
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.wRPcN.oS6eSTKL.A3W',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "AdminUser" WHERE "username" = 'admin');
