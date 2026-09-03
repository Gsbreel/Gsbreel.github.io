<?php
require_once __DIR__ . DIRECTORY_SEPARATOR . 'db_connect.php';

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function getUserId() {
    return $_SESSION['user_id'] ?? null;
}

function getUserRole() {
    return $_SESSION['role'] ?? 'user';
}

function redirect($path) {
    header("Location: " . BASE_URL . $path);
    exit();
}

function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function setFlashMessage($type, $message) {
    $_SESSION['flash'] = [
        'type' => $type,
        'message' => $message
    ];
}

function getFlashMessage() {
    if (!empty($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }

    return null;
}

function callPythonAnalyzer($type, $content) {
    $payload = json_encode([
        'type' => $type,
        'content' => $content
    ]);
    
    $tempFile = tempnam(sys_get_temp_dir(), 'phish_');
    file_put_contents($tempFile, $payload);
    
    $scriptPath = realpath(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'python' . DIRECTORY_SEPARATOR . 'predict.py');
    
    if (!$scriptPath) {
        unlink($tempFile);
        return ['error' => 'Python script not found'];
    }
    
    $command = PYTHON_PATH . ' "' . $scriptPath . '" "' . $tempFile . '" 2>&1';
    $output = shell_exec($command);
    unlink($tempFile);
    
    $result = json_decode($output, true);
    if (!$result || isset($result['error'])) {
        return [
            'error' => $result['error'] ?? 'Analysis failed',
            'debug' => substr($output ?? '', 0, 500)
        ];
    }
    return $result;
}
/**
 * Windows-compatible PDF generation call
 */
function callPythonPDF($data) {
    $payload = json_encode($data);
    
    $tempFile = tempnam(sys_get_temp_dir(), 'pdf_');
    file_put_contents($tempFile, $payload);
    
    $scriptPath = realpath(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'python' . DIRECTORY_SEPARATOR . 'generate_pdf.py');
    
    if (!$scriptPath) {
        unlink($tempFile);
        return ['error' => 'PDF generator not found'];
    }
    
    $command = PYTHON_PATH . ' "' . $scriptPath . '" "' . $tempFile . '" 2>&1';
    $output = shell_exec($command);
    unlink($tempFile);
    
    $result = json_decode($output, true);
    if (!$result || isset($result['error'])) {
        return ['error' => $result['error'] ?? 'PDF generation failed: ' . substr($output, 0, 500)];
    }
    return $result;
}

?>