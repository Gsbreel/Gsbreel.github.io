// Configuration
const CONFIG = {
    API_URL: 'http://localhost/phishing-detection-system/api/analyze.php',
    BACKEND_URL: 'http://localhost/phishing-detection-system/'
};

let detectedEmailThreats = [];

// Get current tab and analyze
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    analyzeCurrentPage(currentTab.url);
    // Request email findings from background
    requestEmailFindings();
    requestLinkFindings();
});

// Request email scan findings from background script
function requestEmailFindings() {
    chrome.runtime.sendMessage({ action: 'getEmailFindings' }, (response) => {
        if (response && response.findings && response.findings.emails && response.findings.emails.length > 0) {
            displayEmailFindings(response.findings.emails);
        } else {
            clearEmailFindings();
        }
    });
}

function requestLinkFindings() {
    chrome.runtime.sendMessage({ action: 'getLinkFindings' }, (response) => {
        if (response && response.findings && response.findings.links && response.findings.links.length > 0) {
            displayLinkFindings(response.findings.links);
        }
    });
}

// Listen for real-time email findings updates from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateEmailFindings') {
        if (request.emails && request.emails.length > 0) {
            displayEmailFindings(request.emails);
        } else {
            clearEmailFindings();
        }
    }

    if (request.action === 'updateLinkFindings') {
        if (request.links && request.links.length > 0) {
            displayLinkFindings(request.links);
        }
    }
});

function clearEmailFindings() {
    detectedEmailThreats = [];

    const emailSection = document.getElementById('emailFindingsSection');
    const emailList = document.getElementById('emailFindingsList');
    const emailCount = document.getElementById('emailCount');

    if (emailList) emailList.innerHTML = '';
    if (emailCount) emailCount.textContent = '0';
    if (emailSection) emailSection.style.display = 'none';
}

function displayLinkFindings(links) {
    const linkSection = document.getElementById('linkFindingsSection');
    const linkList = document.getElementById('linkFindingsList');
    const linkCount = document.getElementById('linkCount');

    if (!linkSection || !linkList) return;

    const sorted = [...links].sort((a, b) => b.riskScore - a.riskScore);
    linkCount.textContent = sorted.length;
    linkList.innerHTML = '';

    sorted.forEach(result => {
        const item = document.createElement('div');
        item.className = 'email-finding-item';

        let riskClass = 'email-risk-safe';
        let riskLabel = 'Safe';
        if (result.riskScore >= 0.6) {
            riskClass = 'email-risk-critical';
            riskLabel = 'Critical';
        } else if (result.riskScore >= 0.35) {
            riskClass = 'email-risk-high';
            riskLabel = 'Suspicious';
        } else if (result.riskScore >= 0.2) {
            riskClass = 'email-risk-medium';
            riskLabel = 'Caution';
        }

        let host = 'link';
        try {
            host = new URL(result.url).hostname;
        } catch (e) {
            host = 'link';
        }

        item.innerHTML = `
            <div class="email-finding-header">
                <span class="email-risk-badge ${riskClass}">${riskLabel}</span>
                <span class="email-domain">${escapeHtml(host)}</span>
                <span class="email-risk-score">${(Number(result.riskScore || 0) * 100).toFixed(0)}%</span>
            </div>
            <div class="email-finding-address">${escapeHtml(result.url)}</div>
            ${result.text ? `<div class="email-finding-address">Text: ${escapeHtml(result.text)}</div>` : ''}
            ${result.explanations && result.explanations.length > 0 ? `
                <div class="email-finding-details">
                    ${result.explanations.map(exp => `<div class="email-detail">• ${escapeHtml(exp)}</div>`).join('')}
                </div>
            ` : `<div class="email-finding-details"><div class="email-detail">• No suspicious link indicators detected.</div></div>`}
        `;

        linkList.appendChild(item);
    });

    linkSection.style.display = 'block';
}

// Display email findings in the popup
function displayEmailFindings(emails) {
    const emailSection = document.getElementById('emailFindingsSection');
    const emailList = document.getElementById('emailFindingsList');
    const emailCount = document.getElementById('emailCount');

    if (!emailSection || !emailList) return;

    // Sort by risk score descending
    const sorted = [...emails].sort((a, b) => b.riskScore - a.riskScore);
    detectedEmailThreats = sorted.filter(email => {
        const classification = String(email.systemResult?.classification || '').toLowerCase();
        const riskLevel = String(email.systemResult?.risk_level || '').toLowerCase();
        return ['phishing', 'malicious', 'spam', 'suspicious'].includes(classification)
            || ['medium', 'high', 'critical'].includes(riskLevel)
            || Number(email.riskScore || 0) >= 0.35;
    });

    emailCount.textContent = sorted.length;
    emailList.innerHTML = '';

    sorted.forEach(result => {
        const item = document.createElement('div');
        item.className = 'email-finding-item';
        const isMessageResult = result.type === 'message';

        let riskClass = 'email-risk-safe';
        let riskLabel = 'Safe';
        if (result.riskScore >= 0.6) {
            riskClass = 'email-risk-critical';
            riskLabel = 'Critical';
        } else if (result.riskScore >= 0.35) {
            riskClass = 'email-risk-high';
            riskLabel = 'Suspicious';
        } else if (result.riskScore >= 0.2) {
            riskClass = 'email-risk-medium';
            riskLabel = 'Caution';
        }

        const spoofBadge = result.spoofInfo
            ? `<span class="spoof-badge">${result.spoofInfo.brand.charAt(0).toUpperCase() + result.spoofInfo.brand.slice(1)} impersonation</span>`
            : '';
        const labelText = isMessageResult ? 'Gmail message' : `@${escapeHtml(result.domain)}`;
        const mainText = isMessageResult
            ? escapeHtml(result.subject || result.preview || 'Visible Gmail message')
            : escapeHtml(result.email);

        item.innerHTML = `
            <div class="email-finding-header">
                <span class="email-risk-badge ${riskClass}">${riskLabel}</span>
                <span class="email-domain">${labelText}</span>
                <span class="email-risk-score">${(result.riskScore * 100).toFixed(0)}%</span>
            </div>
            <div class="email-finding-address">${mainText}</div>
            ${spoofBadge}
            ${result.explanations && result.explanations.length > 0 ? `
                <div class="email-finding-details">
                    ${result.explanations.map(exp => `<div class="email-detail">• ${escapeHtml(exp)}</div>`).join('')}
                </div>
            ` : `<div class="email-finding-details"><div class="email-detail">• No suspicious ${isMessageResult ? 'message' : 'email'} indicators detected.</div></div>`}
        `;

        emailList.appendChild(item);
    });

    emailSection.style.display = 'block';
    updateThreatOverride();
}

// If any automatic email scan detects a threat, do not leave the main page result as SAFE
function updateThreatOverride() {
    if (detectedEmailThreats.length === 0) return;

    const statusBox = document.getElementById('status');
    const resultsSection = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');

    statusBox.style.display = 'none';
    resultsSection.style.display = 'block';

    const highestRisk = detectedEmailThreats[0]?.riskScore || 0;
    const threatText = highestRisk >= 0.6
        ? 'CRITICAL - EMAIL THREAT DETECTED'
        : highestRisk >= 0.35
            ? 'WARNING - SUSPICIOUS EMAIL DETECTED'
            : 'CAUTION - POSSIBLE SPAM EMAIL DETECTED';
    const riskClass = highestRisk >= 0.6 ? 'critical' : highestRisk >= 0.35 ? 'high' : 'medium';
    const riskIcon = highestRisk >= 0.6 ? '🚨' : highestRisk >= 0.35 ? '⚠️' : '⚡';

    resultContent.innerHTML = `
        <div class="result-card ${riskClass}">
            <div class="result-header">
                <span class="risk-icon">${riskIcon}</span>
                <span class="risk-level">${threatText}</span>
            </div>
            <div class="result-score">Detected email threats: ${detectedEmailThreats.length}</div>
            <div class="result-classification">Classification: suspicious</div>
            <div class="result-explanation">Automatic email scanning found suspicious or spam-like email addresses on this page.</div>
        </div>
    `;
}

// Escape HTML for safe display
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function getThreatDisplay(riskLevel, classification, finalScore) {
    const normalizedRisk = String(riskLevel || '').toLowerCase();
    const normalizedClassification = String(classification || '').toLowerCase();
    const score = Number(finalScore || 0);
    const criticalClassifications = ['phishing', 'malicious', 'unsafe', 'threat'];
    const warningClassifications = ['spam', 'suspicious'];

    if (normalizedRisk === 'critical' || criticalClassifications.includes(normalizedClassification) || score >= 0.75) {
        return {
            riskIcon: '🚨',
            riskClass: 'critical',
            riskText: normalizedClassification === 'phishing' ? 'CRITICAL - PHISHING DETECTED' : 'CRITICAL - THREAT DETECTED'
        };
    }

    if (normalizedRisk === 'high' || warningClassifications.includes(normalizedClassification) || score >= 0.55) {
        return {
            riskIcon: '⚠️',
            riskClass: 'high',
            riskText: normalizedClassification === 'spam' ? 'WARNING - SPAM DETECTED' : 'WARNING - SUSPICIOUS'
        };
    }

    if (normalizedRisk === 'medium' || score >= 0.35) {
        return {
            riskIcon: '⚡',
            riskClass: 'medium',
            riskText: 'CAUTION - MODERATE RISK'
        };
    }

    return {
        riskIcon: '✅',
        riskClass: 'safe',
        riskText: 'SAFE'
    };
}

// Analyze current page
async function analyzeCurrentPage(url) {
    try {
        const result = await analyzeURL(url);
        displayResult(result, 'page');
    } catch (error) {
        showError('Failed to analyze page: ' + error.message);
    }
}

// Analyze URL
async function analyzeURL(urlOrEmail) {
    const formData = new FormData();
    
    // Determine if it's URL or email
    const isEmail = urlOrEmail.includes('@');
    formData.append('type', isEmail ? 'email' : 'url');
    formData.append('content', urlOrEmail);

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('API connection failed: ' + error.message);
    }
}

// Display result
function displayResult(result, source = 'manual') {
    const statusBox = document.getElementById('status');
    const resultsSection = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');
    const threatsSection = document.getElementById('threatsSection');
    const threatsList = document.getElementById('threatsList');

    statusBox.style.display = 'none';
    resultsSection.style.display = 'block';

    if (result.error) {
        resultContent.innerHTML = `<div class="error-message">⚠️ ${result.error}</div>`;
        return;
    }

    if (detectedEmailThreats.length > 0) {
        updateThreatOverride();
        return;
    }

    // Determine risk level
    const riskLevel = result.risk_level || 'safe';
    const classification = result.classification || 'safe';
    const finalScore = result.final_score || 0;

    const { riskIcon, riskClass, riskText } = getThreatDisplay(riskLevel, classification, finalScore);

    // Main result display
    const html = `
        <div class="result-card ${riskClass}">
            <div class="result-header">
                <span class="risk-icon">${riskIcon}</span>
                <span class="risk-level">${riskText}</span>
            </div>
            <div class="result-score">Risk Score: ${(finalScore * 100).toFixed(1)}%</div>
            <div class="result-classification">Classification: ${classification}</div>
            ${result.explanation ? `<div class="result-explanation">${result.explanation}</div>` : ''}
            ${result.explanations && result.explanations.length > 0 ? `
                <div class="result-details">
                    <strong>Details:</strong>
                    <ul>
                        ${result.explanations.map(exp => `<li>${exp}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;

    resultContent.innerHTML = html;

    // Show threats if any
    if (result.url_details && result.url_details.length > 0) {
        const maliciousUrls = result.url_details.filter(u => u.classification === 'malicious');
        if (maliciousUrls.length > 0) {
            threatsSection.style.display = 'block';
            threatsList.innerHTML = maliciousUrls.map(url => `
                <div class="threat-item">
                    <div class="threat-url">${url.expanded_url}</div>
                    <div class="threat-reason">${url.features ? Object.keys(url.features).join(', ') : 'Malicious domain detected'}</div>
                </div>
            `).join('');
        }
    }
}

// Show error
function showError(message) {
    const statusBox = document.getElementById('status');
    statusBox.className = 'status-box error';
    document.getElementById('statusText').textContent = message;
}

// Manual analysis button
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const input = document.getElementById('urlInput').value.trim();
    if (!input) {
        alert('Please enter a URL or email address');
        return;
    }

    const manualResult = document.getElementById('manualResult');
    manualResult.innerHTML = '<div class="spinner"></div> Analyzing...';

    try {
        const result = await analyzeURL(input);
        displayManualResult(result, input);
    } catch (error) {
        manualResult.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    }
});

// Display manual analysis result
function displayManualResult(result, input) {
    const manualResult = document.getElementById('manualResult');

    if (result.error) {
        manualResult.innerHTML = `<div class="error-message">${result.error}</div>`;
        return;
    }

    const riskLevel = result.risk_level || 'safe';
    const classification = result.classification || 'safe';
    const finalScore = result.final_score || 0;

    const { riskIcon, riskClass } = getThreatDisplay(riskLevel, classification, finalScore);

    const html = `
        <div class="result-card ${riskClass}" style="margin-top: 10px;">
            <div class="result-small">
                <span>${riskIcon}</span>
                <span>${input}</span>
                <span>${(finalScore * 100).toFixed(1)}% risk</span>
            </div>
            ${result.explanations && result.explanations.length > 0 ? `
                <div style="margin-top: 8px; font-size: 12px;">
                    ${result.explanations[0]}
                </div>
            ` : ''}
        </div>
    `;

    manualResult.innerHTML = html;
}

// History button
document.getElementById('historyBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: CONFIG.BACKEND_URL + 'history.php' });
});

// Enter key on input
document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('analyzeBtn').click();
    }
});
