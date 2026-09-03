<?php
require_once __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'functions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = getUserId();
$limit = min(intval($_GET['limit'] ?? 100), 200);
$offset = intval($_GET['offset'] ?? 0);

try {
    $stmt = $pdo->prepare("
        SELECT analysis_id, input_type, input_content, final_score, classification, 
               risk_level, explanation, created_at 
        FROM analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$user_id, $limit, $offset]);
    $history = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $history]);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Failed to fetch history']);
}
?>