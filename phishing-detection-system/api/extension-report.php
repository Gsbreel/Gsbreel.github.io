<?php
/**
 * Extension Report API - Save threat reports from browser extension
 */

require_once __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: chrome-extension://*');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'report_threat':
        reportThreat();
        break;
    
    case 'get_extension_status':
        echo json_encode(['status' => 'connected', 'version' => '1.0']);
        break;
    
    default:
        echo json_encode(['error' => 'Unknown action']);
}

function reportThreat() {
    global $pdo;
    
    $url = sanitizeInput($_POST['url'] ?? '');
    $threat_type = sanitizeInput($_POST['threat_type'] ?? '');
    $description = sanitizeInput($_POST['description'] ?? '');
    $user_id = getUserId();

    if (empty($url)) {
        echo json_encode(['error' => 'URL required']);
        return;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO extension_reports (user_id, threat_url, threat_type, description, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$user_id, $url, $threat_type, $description]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Threat reported successfully',
            'report_id' => $pdo->lastInsertId()
        ]);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
