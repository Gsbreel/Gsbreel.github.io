USE phishing_detector;

-- Roll back the admin module changes that were added for role and activation management.
-- This preserves existing users and analyses data.

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'is_active'
);

SET @stmt = IF(@col_exists > 0,
    'ALTER TABLE users DROP COLUMN is_active',
    'SELECT "is_active was not present"');

PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Only drop the role column if it was introduced by the admin module and not otherwise required.
-- The original schema used users.role before this module; if you want to remove it, run this manually after confirming it is safe.
-- ALTER TABLE users DROP COLUMN role;

DROP INDEX IF EXISTS idx_users_active ON users;
DROP INDEX IF EXISTS idx_users_role ON users;
