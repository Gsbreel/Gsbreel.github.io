-- Create table for extension reports (if not exists)
CREATE TABLE IF NOT EXISTS extension_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    threat_url VARCHAR(2048),
    threat_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_reports ON extension_reports(user_id, created_at);
