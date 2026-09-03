<?php
require_once __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'functions.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

// Get selected IDs
$selectedIds = $_POST['ids'] ?? '';
if (empty($selectedIds)) {
    echo json_encode(['error' => 'No records selected']);
    exit;
}

$ids = explode(',', $selectedIds);
$ids = array_filter($ids, 'is_numeric');
$ids = array_map('intval', $ids);

if (empty($ids)) {
    echo json_encode(['error' => 'Invalid selection']);
    exit;
}

$user_id = getUserId();

// Fetch selected records (only belonging to current user)
$placeholders = implode(',', array_fill(0, count($ids), '?'));
try {
    $stmt = $pdo->prepare("
        SELECT analysis_id, input_type, input_content, text_score, url_score, 
               final_score, classification, risk_level, explanation, created_at 
        FROM analyses 
        WHERE user_id = ? AND analysis_id IN ($placeholders)
        ORDER BY created_at DESC
    ");
    
    $params = array_merge([$user_id], $ids);
    $stmt->execute($params);
    $records = $stmt->fetchAll();
    
    if (empty($records)) {
        echo json_encode(['error' => 'No records found']);
        exit;
    }
    
    // Generate PDF via Python
    $pdfData = generatePDF($records, $_SESSION['username']);
    
    if (isset($pdfData['error'])) {
        echo json_encode(['error' => $pdfData['error']]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'pdf_base64' => $pdfData['pdf_base64'],
        'filename' => $pdfData['filename']
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

/**
 * Generate PDF using Python FPDF - Fixed for clean output
 */
function generatePDF($records, $username) {
    $payload = json_encode([
        'username' => $username,
        'records' => $records
    ]);
    
    $tempFile = tempnam(sys_get_temp_dir(), 'pdf_');
    file_put_contents($tempFile, $payload);
    
    $scriptPath = realpath(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'python' . DIRECTORY_SEPARATOR . 'generate_pdf.py');
    
    if (!$scriptPath) {
        unlink($tempFile);
        return ['error' => 'PDF generator not found at: ' . __DIR__ . '\\..\\python\\generate_pdf.py'];
    }
    
    // Use proc_open for clean output capture (no stderr mixing)
    $descriptors = [
        0 => ['pipe', 'r'],  // stdin
        1 => ['pipe', 'w'],  // stdout (JSON output)
        2 => ['pipe', 'w']   // stderr (errors/warnings)
    ];
    
    $process = proc_open(
        PYTHON_PATH . ' -W ignore "' . $scriptPath . '" "' . $tempFile . '"',
        $descriptors,
        $pipes
    );
    
    if (!is_resource($process)) {
        unlink($tempFile);
        return ['error' => 'Failed to start Python process'];
    }
    
    // Close stdin immediately
    fclose($pipes[0]);
    
    // Read stdout and stderr separately
    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    
    fclose($pipes[1]);
    fclose($pipes[2]);
    
    $returnCode = proc_close($process);
    unlink($tempFile);
    
    // Log stderr for debugging but don't include in response
    if (!empty($stderr)) {
        $logFile = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'logs' . DIRECTORY_SEPARATOR . 'pdf_debug.log';
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - STDERR: " . $stderr . "\n", FILE_APPEND);
    }
    
    if ($returnCode !== 0) {
        return ['error' => 'Python process failed with code ' . $returnCode . '. Error: ' . substr($stderr, 0, 500)];
    }
    
    // Clean stdout - remove any warning text before JSON
    $stdout = trim($stdout);
    
    // Find the first { to start of JSON
    $jsonStart = strpos($stdout, '{');
    if ($jsonStart !== false && $jsonStart > 0) {
        $stdout = substr($stdout, $jsonStart);
    }
    
    $result = json_decode($stdout, true);
    if (!$result) {
        return [
            'error' => 'Invalid JSON from Python. Raw output: ' . substr($stdout, 0, 500),
            'debug_stderr' => substr($stderr, 0, 300)
        ];
    }
    
    return $result;
}
?>