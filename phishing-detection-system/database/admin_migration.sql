USE phishing_detector;

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'is_active'
);

SET @stmt = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role',
    'SELECT "is_active already exists"');

PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE users
    MODIFY COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user';

CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_role ON users(role);
