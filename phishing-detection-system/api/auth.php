<?php
require_once __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'functions.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? '';

// ==================== REGISTER ====================
if ($action === 'register') {
    $username = sanitizeInput($_POST['username'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }
    
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
        exit;
    }
    
    if (strlen($username) < 3) {
        echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters.']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
        exit;
    }
    
    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $hash]);
        
        // Get the new user ID
        $newUserId = $pdo->lastInsertId();
        
        // AUTO-LOGIN after registration
        session_regenerate_id(true);
        $_SESSION['user_id'] = $newUserId;
        $_SESSION['username'] = $username;
        unset($_SESSION['role']);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Registration successful! Welcome, ' . $username . '!',
            'username' => $username,
            'redirect' => 'index.php'
        ]);
        
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            // Check if username or email exists
            $stmt = $pdo->prepare("SELECT username, email FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            $existing = $stmt->fetch();
            
            if ($existing && $existing['username'] === $username) {
                echo json_encode(['success' => false, 'message' => 'Username already taken.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Email already registered.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
        }
    }
    
// ==================== LOGIN ====================
} elseif ($action === 'login') {
    $username = sanitizeInput($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please enter username and password.']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT user_id, username, password_hash FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        // Set session
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        
        echo json_encode([
            'success' => true, 
            'message' => 'Welcome back, ' . $user['username'] . '!',
            'username' => $user['username'],
            'redirect' => 'index.php'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }
    
// ==================== LOGOUT ====================
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
    
// ==================== CHECK SESSION ====================
} elseif ($action === 'check') {
    if (isLoggedIn()) {
        echo json_encode([
            'success' => true,
            'logged_in' => true,
            'username' => $_SESSION['username']
        ]);
    } else {
        echo json_encode(['success' => true, 'logged_in' => false]);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}
?>