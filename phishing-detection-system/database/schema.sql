CREATE DATABASE IF NOT EXISTS phishing_detector CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phishing_detector;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE analyses (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    input_type ENUM('email', 'sms', 'url', 'combined') NOT NULL,
    input_content TEXT NOT NULL,
    text_score DECIMAL(5,4) DEFAULT NULL,
    url_score DECIMAL(5,4) DEFAULT NULL,
    final_score DECIMAL(5,4) NOT NULL,
    classification ENUM('phishing', 'legitimate') NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE urls (
    url_id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_id INT NOT NULL,
    raw_url VARCHAR(2048) NOT NULL,
    expanded_url VARCHAR(2048),
    domain_age INT,
    is_malicious BOOLEAN,
    FOREIGN KEY (analysis_id) REFERENCES analyses(analysis_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_id INT NOT NULL,
    user_id INT,
    is_correct BOOLEAN NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES analyses(analysis_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_analyses_user ON analyses(user_id);
CREATE INDEX idx_analyses_date ON analyses(created_at);
CREATE INDEX idx_analyses_class ON analyses(classification);