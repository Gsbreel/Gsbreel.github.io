<?php
require_once __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'functions.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$type = sanitizeInput($_POST['type'] ?? 'email');
$content = $_POST['content'] ?? '';
$user_id = getUserId();

if (empty($content)) {
    echo json_encode(['error' => 'No content']);
    exit;
}

$result = callPythonAnalyzer($type, $content);

if (isset($result['error'])) {
    echo json_encode($result);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO analyses (user_id, input_type, input_content, text_score, url_score, final_score, classification, risk_level, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $explanationText = implode("; ", $result['explanations'] ?? []);
    $stmt->execute([$user_id, $type, $content, $result['text_score'] ?? null, $result['url_score'] ?? null, $result['final_score'], $result['classification'], $result['risk_level'], $explanationText]);
    
    $analysis_id = $pdo->lastInsertId();
    $result['analysis_id'] = $analysis_id;
    
    if (!empty($result['url_details'])) {
        $urlStmt = $pdo->prepare("INSERT INTO urls (analysis_id, raw_url, expanded_url, domain_age, is_malicious) VALUES (?, ?, ?, ?, ?)");
        foreach ($result['url_details'] as $u) {
            $urlStmt->execute([$analysis_id, $u['expanded_url'] ?? '', $u['expanded_url'] ?? '', $u['features']['domain_age'] ?? null, ($u['classification'] === 'malicious') ? 1 : 0]);
        }
    }
} catch (PDOException $e) {
    $result['db_error'] = $e->getMessage();
}

echo json_encode($result);
?>