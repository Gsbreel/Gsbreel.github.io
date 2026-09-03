<?php
require_once 'includes/functions.php';
if (!isLoggedIn()) redirect('login.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>History - PhishGuard AI</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        /* Checkbox and selection styles */
        .select-col { width: 40px; text-align: center; }
        .history-checkbox {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--primary);
        }
        .select-all-checkbox {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--primary);
        }
        .row-selected {
            background-color: #eff6ff !important;
        }
        
        /* Action bar */
        .action-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 0.75rem 1rem;
            background: var(--card);
            border-radius: 8px;
            border: 1px solid var(--border);
        }
        .selection-info {
            font-size: 0.875rem;
            color: var(--text-light);
        }
        .selection-info strong {
            color: var(--primary);
        }
        
        /* Download button */
        .btn-download {
            background: var(--danger);
            color: white;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }
        .btn-download:hover {
            background: #b91c1c;
        }
        .btn-download:disabled {
            background: var(--text-light);
            cursor: not-allowed;
        }
        
        /* Loading overlay */
        .pdf-loading {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }
        .pdf-loading.active {
            display: flex;
        }
        .pdf-loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid white;
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .pdf-loading-text {
            color: white;
            margin-top: 1rem;
            font-size: 1.125rem;
        }
        
        /* Empty state */
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--text-light);
        }
        .empty-state-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="background-shell">
        <canvas id="bg-particles"></canvas>
        <div class="signal-ring ring-1"></div>
        <div class="signal-ring ring-2"></div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="grid-overlay"></div>
    </div>
    <div class="page-shell">
    <!-- PDF Loading Overlay -->
    <div class="pdf-loading" id="pdfLoading">
        <div class="pdf-loading-spinner"></div>
        <div class="pdf-loading-text">Generating PDF...</div>
    </div>

    <nav class="navbar">
        <a href="index.php" class="navbar-brand">PhishGuard AI</a>
        <div class="nav-links">
            <a href="index.php">Analyze</a>
            <a href="history.php" class="active">History</a>
            <a href="#" onclick="logout()">Logout (<?php echo htmlspecialchars($_SESSION['username']); ?>)</a>
        </div>
    </nav>

    <div class="container">
        <!-- Welcome Banner -->
        <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div>
                    <div style="font-size: 1.25rem; font-weight: 700;">
                        <?php echo htmlspecialchars($_SESSION['username']); ?>'s Detection History
                    </div>
                    <div style="opacity: 0.9; margin-top: 0.25rem;">
                        Select records and download as PDF report
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Bar -->
        <div class="action-bar" id="actionBar" style="display: none;">
            <div class="selection-info">
                Selected: <strong id="selectedCount">0</strong> records
            </div>
            <button class="btn btn-download" id="downloadBtn" onclick="downloadSelected()" disabled>
                Download PDF
            </button>
        </div>

        <!-- History Table -->
        <div class="card">
            <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                <span>All Analyses</span>
                <span style="font-size: 0.875rem; color: var(--text-light);" id="totalRecords">Loading...</span>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th class="select-col">
                                <input type="checkbox" class="select-all-checkbox" id="selectAll" onchange="toggleSelectAll()">
                            </th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Content Preview</th>
                            <th>Result</th>
                            <th>Score</th>
                            <th>Risk</th>
                        </tr>
                    </thead>
                    <tbody id="historyTable">
                        <tr><td colspan="7" style="text-align:center;color:var(--text-light);padding:2rem;">Loading history...</td></tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Empty State (hidden by default) -->
            <div class="empty-state" id="emptyState" style="display: none;">
                <div class="empty-state-icon">📭</div>
                <div style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">No History Yet</div>
                <div>Start analyzing emails, SMS, or URLs to see them here.</div>
                <a href="index.php" class="btn btn-primary" style="margin-top: 1rem;">Go Analyze</a>
            </div>
        </div>
    </div>

    <script>
        let allRecords = [];
        let selectedIds = new Set();

        async function loadHistory() {
            try {
                const res = await fetch('api/get_history.php?limit=200');
                const data = await res.json();
                const tbody = document.getElementById('historyTable');
                const emptyState = document.getElementById('emptyState');
                const totalRecords = document.getElementById('totalRecords');
                
                if (data.error) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;padding:2rem;">${data.error}</td></tr>`;
                    return;
                }
                
                allRecords = data.data || [];
                
                if (allRecords.length === 0) {
                    tbody.innerHTML = '';
                    emptyState.style.display = 'block';
                    totalRecords.textContent = '0 records';
                    document.getElementById('actionBar').style.display = 'none';
                    return;
                }
                
                emptyState.style.display = 'none';
                totalRecords.textContent = `${allRecords.length} records`;
                document.getElementById('actionBar').style.display = 'flex';
                
                tbody.innerHTML = allRecords.map(row => {
                    const content = row.input_content.length > 60 
                        ? row.input_content.substring(0, 57) + '...' 
                        : row.input_content;
                    const badgeClass = row.classification === 'phishing' ? 'badge-phishing' : 'badge-safe';
                    const isSelected = selectedIds.has(String(row.analysis_id)) ? 'row-selected' : '';
                    
                    return `
                        <tr class="${isSelected}" data-id="${row.analysis_id}">
                            <td class="select-col">
                                <input type="checkbox" class="history-checkbox" 
                                    value="${row.analysis_id}" 
                                    ${selectedIds.has(String(row.analysis_id)) ? 'checked' : ''}
                                    onchange="toggleRow(${row.analysis_id}, this.checked)">
                            </td>
                            <td>${new Date(row.created_at).toLocaleDateString()}</td>
                            <td>${row.input_type.toUpperCase()}</td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${row.input_content.replace(/"/g, '&quot;')}">${content}</td>
                            <td><span class="badge ${badgeClass}">${row.classification}</span></td>
                            <td>${(row.final_score * 100).toFixed(1)}%</td>
                            <td>${row.risk_level}</td>
                        </tr>
                    `;
                }).join('');
                
                updateSelectionUI();
                
            } catch (err) {
                document.getElementById('historyTable').innerHTML = 
                    `<tr><td colspan="7" style="text-align:center;color:red;padding:2rem;">Failed to load history</td></tr>`;
            }
        }

        function toggleRow(id, checked) {
            const idStr = String(id);
            if (checked) {
                selectedIds.add(idStr);
            } else {
                selectedIds.delete(idStr);
            }
            
            // Update row visual
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                if (checked) {
                    row.classList.add('row-selected');
                } else {
                    row.classList.remove('row-selected');
                }
            }
            
            updateSelectionUI();
        }

        function toggleSelectAll() {
            const selectAll = document.getElementById('selectAll');
            const checkboxes = document.querySelectorAll('.history-checkbox');
            
            checkboxes.forEach(cb => {
                cb.checked = selectAll.checked;
                toggleRow(cb.value, selectAll.checked);
            });
        }

        function updateSelectionUI() {
            const count = selectedIds.size;
            document.getElementById('selectedCount').textContent = count;
            document.getElementById('downloadBtn').disabled = count === 0;
        }

        async function downloadSelected() {
            if (selectedIds.size === 0) {
                alert('Please select at least one record.');
                return;
            }
            
            const loading = document.getElementById('pdfLoading');
            loading.classList.add('active');
            
            try {
                const formData = new FormData();
                formData.append('ids', Array.from(selectedIds).join(','));
                
                const response = await fetch('api/download_pdf.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Decode base64 and download
                const byteCharacters = atob(data.pdf_base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = data.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                
            } catch (err) {
                alert('PDF download failed: ' + err.message);
            } finally {
                loading.classList.remove('active');
            }
        }

        function logout() {
            fetch('api/auth.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: 'action=logout'
            }).then(() => window.location.href = 'login.php');
        }
        
        // Load history on page load
        loadHistory();
    </script>
    <script src="assets/js/app.js"></script>
    </div>
</body>
</html>