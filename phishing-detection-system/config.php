<?php
session_start();

// ==================== DATABASE CONFIG ====================
define('DB_HOST', 'localhost');
define('DB_NAME', 'phishing_detector');
define('DB_USER', 'root');
define('DB_PASS', '');          // XAMPP default: empty password

// ==================== PYTHON CONFIG ====================
// Windows: Use 'python' or 'py' (try 'python' first)
define('PYTHON_PATH', 'python');

// Base URL for your project
define('BASE_URL', 'http://localhost/phishing-detection-system/');

// ==================== PATHS ====================
define('BASE_DIR', __DIR__);
define('PYTHON_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'python' . DIRECTORY_SEPARATOR);
define('MODELS_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'models' . DIRECTORY_SEPARATOR);

// ==================== ERROR REPORTING ====================
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ==================== SECURITY HEADERS ====================
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");
?>