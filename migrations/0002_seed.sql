-- Insert or update the admin user for Cloudflare D1 (SQLite)
INSERT INTO "users" (
    "id",
    "email",
    "name",
    "username",
    "password",
    "role",
    "createdAt",
    "updatedAt"
)
VALUES (
    'admin_user_id_123',
    'admin@tivoads.com',
    'TivoAds Admin',
    'admin',
    '$2a$12$twQwTCk7lgIKTfI9z83wHucJ3Lb60ZHekfYPFmcBtTRKnKkjdtUkK',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT("email") DO UPDATE SET
    "name" = excluded."name",
    "username" = excluded."username",
    "password" = excluded."password",
    "role" = excluded."role",
    "updatedAt" = CURRENT_TIMESTAMP;