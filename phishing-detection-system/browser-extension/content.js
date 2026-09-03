// Content Script - Runs on every webpage

// ==================== EMAIL SCANNER ====================

// Known legitimate domains for brand impersonation detection
const KNOWN_BRAND_DOMAINS = {
    'paypal': ['paypal.com', 'paypal.co.uk', 'paypal.de', 'paypal.fr'],
    'google': ['google.com', 'gmail.com', 'youtube.com', 'googlemail.com'],
    'microsoft': ['microsoft.com', 'outlook.com', 'hotmail.com', 'live.com'],
    'apple': ['apple.com', 'icloud.com', 'me.com'],
    'amazon': ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.co.jp'],
    'netflix': ['netflix.com', 'nflximg.com'],
    'facebook': ['facebook.com', 'fb.com', 'messenger.com'],
    'twitter': ['twitter.com', 'x.com'],
    'instagram': ['instagram.com'],
    'linkedin': ['linkedin.com'],
    'whatsapp': ['whatsapp.com'],
    'telegram': ['telegram.org'],
    'wordpress': ['wordpress.com', 'wordpress.org'],
    'shopify': ['shopify.com'],
    'dropbox': ['dropbox.com'],
    'dhl': ['dhl.com'],
    'fedex': ['fedex.com'],
    'ups': ['ups.com'],
    'ebay': ['ebay.com', 'ebay.co.uk'],
    'payoneer': ['payoneer.com'],
    'skrill': ['skrill.com'],
    'wise': ['wise.com'],
    'revolut': ['revolut.com'],
    'monzo': ['monzo.com'],
    'airbnb': ['airbnb.com'],
    'uber': ['uber.com'],
    'lyft': ['lyft.com'],
    'booking': ['booking.com'],
    'expedia': ['expedia.com'],
    'venmo': ['venmo.com'],
    'cashapp': ['cash.app', 'square.com']
};

// Suspicious TLDs commonly used in phishing
const SUSPICIOUS_TLDS = [
    '.tk', '.ml', '.cf', '.ga', '.gq', '.top', '.xyz',
    '.club', '.online', '.site', '.click', '.link',
    '.work', '.bid', '.trade', '.webcam', '.science',
    '.date', '.party', '.review', '.trade', '.men',
    '.download', '.racing', '.stream', '.loan', '.win',
    '.mom', '.lol', '.pics', '.homes', '.best',
    '.live', '.mobi', '.info', '.biz'
];

// Email patterns that indicate high spam/phishing risk
const SPAMMY_EMAIL_PATTERNS = [
    /noreply/i,
    /no-reply/i,
    /donotreply/i,
    /do-not-reply/i,
    /newsletter/i,
    /marketing/i,
    /advertisement/i,
    /campaign/i,
    /promo/i,
    /billing/i,
    /service.?desk/i,
    /support.?team/i,
    /security.?alert/i,
    /account.?alert/i,
    /verify/i,
    /confirm/i,
    /update.?account/i
];

// ==================== CORE FUNCTIONS ====================

// Extract domain from email
function extractDomain(email) {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase().trim() : null;
}

// Extract local part (before @)
function extractLocalPart(email) {
    const parts = email.split('@');
    return parts.length === 2 ? parts[0].toLowerCase().trim() : null;
}

// Check if a domain looks like it's spoofing a known brand
function detectDomainSpoof(domain) {
    if (!domain) return null;

    for (const [brand, legitimateDomains] of Object.entries(KNOWN_BRAND_DOMAINS)) {
        // Check if this is exactly a legitimate domain
        if (legitimateDomains.includes(domain)) {
            return null; // Legitimate, no spoof
        }

        // Check for brand name in domain (potential spoof)
        const brandLower = brand.toLowerCase();
        const domainParts = domain.split('.');

        // Check if brand name appears anywhere in the domain
        if (domain.includes(brandLower)) {
            // But it's NOT one of the legitimate domains
            return {
                brand: brand,
                legitimateDomains: legitimateDomains,
                similarity: calculateDomainSimilarity(domain, brandLower)
            };
        }

        // Check for common typosquatting patterns
        for (const legit of legitimateDomains) {
            const legitBase = legit.split('.')[0];
            const domainBase = domainParts[0];

            if (domainBase && legitBase) {
                // Levenshtein distance check for typosquatting
                const dist = levenshteinDistance(domainBase, legitBase);
                if (dist > 0 && dist <= 2) {
                    return {
                        brand: brand,
                        legitimateDomains: legitimateDomains,
                        similarity: 'typosquatting'
                    };
                }
            }
        }
    }

    return null;
}

// Simple Levenshtein distance
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Calculate similarity score for brand name in domain
function calculateDomainSimilarity(domain, brand) {
    const domainParts = domain.split('.');

    // Check if brand is subdomain (e.g., paypal.phishing.com)
    if (domainParts.length > 2) {
        const subdomain = domainParts[0].toLowerCase();
        if (subdomain === brand) {
            return 'brand-as-subdomain';
        }
        if (subdomain.includes(brand)) {
            return 'brand-in-subdomain';
        }
    }

    // Check if brand is part of main domain (e.g., paypalsecure.com)
    const mainDomain = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : domainParts[0];
    if (mainDomain.includes(brand)) {
        return 'brand-in-main-domain';
    }

    return 'brand-mentioned';
}

// Check if domain uses suspicious TLD
function hasSuspiciousTLD(domain) {
    if (!domain) return false;
    return SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld));
}

// Check if local part of email matches suspicious patterns
function isSpammyLocalPart(localPart) {
    if (!localPart) return false;
    // Check for excessive numbers
    const digitCount = (localPart.match(/\d/g) || []).length;
    if (digitCount > localPart.length * 0.4) return true;

    // Check for excessive special chars
    const specialCount = (localPart.match(/[_.\-+=~]/g) || []).length;
    if (specialCount > 3) return true;

    // Check for random-looking strings (high entropy)
    const uniqueChars = new Set(localPart).size;
    if (uniqueChars > 10 && localPart.length > 8) return true;

    // Check against spammy patterns
    return SPAMMY_EMAIL_PATTERNS.some(pattern => pattern.test(localPart));
}

// Generate risk explanation for an email
function generateEmailExplanation(email, domain, localPart, spoofInfo) {
    const reasons = [];

    if (spoofInfo) {
        const brand = spoofInfo.brand.charAt(0).toUpperCase() + spoofInfo.brand.slice(1);
        reasons.push(`⚠️ Claims to be from ${brand} but uses ${domain} instead of ${spoofInfo.legitimateDomains[0]}`);
    }

    if (hasSuspiciousTLD(domain)) {
        reasons.push(`Suspicious domain extension (${domain.split('.').pop()}) - commonly used in phishing`);
    }

    if (isSpammyLocalPart(localPart)) {
        reasons.push('Suspicious email prefix pattern - typical of automated/mass emails');
    }

    if (spoofInfo && spoofInfo.similarity === 'typosquatting') {
        reasons.push('Typosquatting detected - domain closely mimics a legitimate brand');
    }

    if (spoofInfo && spoofInfo.similarity === 'brand-as-subdomain') {
        reasons.push('Brand name used as subdomain to deceive - legitimate email would come from the brand\'s own domain');
    }

    return reasons;
}

// Calculate risk score for email (0-1)
function calculateEmailRiskScore(domain, localPart, spoofInfo) {
    let score = 0;

    // Domain-based scoring
    if (spoofInfo) score += 0.4;
    if (hasSuspiciousTLD(domain)) score += 0.2;
    if (isSpammyLocalPart(localPart)) score += 0.15;

    // Typosquatting is extra suspicious
    if (spoofInfo && spoofInfo.similarity === 'typosquatting') score += 0.15;
    if (spoofInfo && spoofInfo.similarity === 'brand-as-subdomain') score += 0.1;

    return Math.min(score, 1.0);
}

// ==================== PAGE SCANNING ====================

// Email scan results
let emailScanResults = [];
let scannedEmails = new Set();
let pendingEmailChecks = new Set();
const emailResultsByAddress = new Map();
let scannedMessageKeys = new Set();
let pendingMessageChecks = new Set();
const messageResultsByKey = new Map();
const linkResultsByUrl = new Map();

const WEBMAIL_HOST_PATTERNS = [
    /(^|\.)mail\.google\.com$/i,
    /(^|\.)outlook\.live\.com$/i,
    /(^|\.)outlook\.office\.com$/i,
    /(^|\.)outlook\.office365\.com$/i,
    /(^|\.)mail\.yahoo\.com$/i,
    /(^|\.)proton\.me$/i,
    /(^|\.)protonmail\.com$/i,
    /(^|\.)zoho\.com$/i,
    /(^|\.)aol\.com$/i,
    /(^|\.)icloud\.com$/i
];

function shouldScanEmailContent() {
    return WEBMAIL_HOST_PATTERNS.some(pattern => pattern.test(window.location.hostname));
}

const SPAM_MESSAGE_PATTERNS = [
    /urgent/i,
    /verify\s+(your\s+)?account/i,
    /account\s+(will\s+be\s+)?(suspended|locked|closed)/i,
    /password\s+expires?/i,
    /security\s+alert/i,
    /unusual\s+(sign.?in|login|activity)/i,
    /payment\s+(failed|required|overdue)/i,
    /claim\s+(your\s+)?(reward|prize|refund)/i,
    /winner|congratulations/i,
    /gift\s*card/i,
    /limited\s+time/i,
    /click\s+here/i,
    /act\s+now/i
];

function classifySystemThreat(systemResult, minimumScore = 0.35) {
    if (!systemResult || systemResult.error) return false;

    const score = Number(systemResult.final_score ?? 0);
    const riskLevel = String(systemResult.risk_level || '').toLowerCase();
    const classification = String(systemResult.classification || '').toLowerCase();

    return ['medium', 'high', 'critical'].includes(riskLevel)
        || ['suspicious', 'malicious', 'spam', 'phishing'].includes(classification)
        || score >= minimumScore;
}

// Find all email addresses in the page content
function findAllEmails() {
    const emails = [];
    const emailRegex = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;
    const scanRoot = document.body || document.documentElement;

    if (!scanRoot) {
        return [];
    }

    // 1. Scan visible text in the body (text nodes)
    const walker = document.createTreeWalker(
        scanRoot,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        const matches = node.textContent.match(emailRegex);
        if (matches) {
            matches.forEach(email => emails.push(email));
        }
    }

    // 2. Scan mailto: links
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        const href = link.getAttribute('href');
        const email = href.replace(/^mailto:/i, '').split('?')[0];
        if (email && emailRegex.test(email)) {
            emails.push(email);
        }
    });

    // 3. Scan all href attributes for emails
    document.querySelectorAll('[href*="@"]').forEach(el => {
        const href = el.getAttribute('href');
        if (href) {
            const matches = href.match(emailRegex);
            if (matches) {
                matches.forEach(email => emails.push(email));
            }
        }
    });

    // 4. Scan meta tags (common in newsletter pages)
    document.querySelectorAll('meta[name="reply-to"], meta[property*="email"]').forEach(meta => {
        const content = meta.getAttribute('content');
        if (content) {
            const matches = content.match(emailRegex);
            if (matches) {
                matches.forEach(email => emails.push(email));
            }
        }
    });

    // 5. Scan attributes used by Gmail and other webmail apps.
    // Gmail often stores sender addresses in attributes instead of visible text.
    const emailAttributes = [
        'email',
        'data-email',
        'data-hovercard-id',
        'title',
        'aria-label',
        'name',
        'data-name',
        'data-tooltip',
        'data-tooltip-text'
    ];

    document.querySelectorAll('*').forEach(element => {
        emailAttributes.forEach(attribute => {
            const value = element.getAttribute(attribute);
            if (!value) return;

            const matches = value.match(emailRegex);
            if (matches) {
                matches.forEach(email => emails.push(email));
            }
        });
    });

    // Deduplicate
    return [...new Set(emails.map(e => e.toLowerCase().trim()))];
}

// Convert your system's API response into the extension's email result format
function mergeSystemEmailResult(localResult, systemResult) {
    if (!systemResult || systemResult.error) {
        return localResult;
    }

    const systemScore = Number(systemResult.final_score ?? 0);
    const systemExplanations = Array.isArray(systemResult.explanations)
        ? systemResult.explanations
        : (systemResult.explanation ? [systemResult.explanation] : []);
    const systemRiskLevel = String(systemResult.risk_level || '').toLowerCase();
    const systemClassification = String(systemResult.classification || '').toLowerCase();
    const systemSuspicious = classifySystemThreat(systemResult);

    return {
        ...localResult,
        riskScore: Math.max(localResult.riskScore, systemScore),
        explanations: [...new Set([...localResult.explanations, ...systemExplanations])],
        systemResult,
        checkedBySystem: true,
        isSuspicious: localResult.isSuspicious || systemSuspicious
    };
}

function getVisibleText(element) {
    return (element?.innerText || element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function findVisibleEmailMessages() {
    const messages = [];
    const selectors = [
        'tr.zA',
        'div[role="main"] tr[role="link"]',
        'div[role="main"] tr[role="row"]',
        'div[role="main"] div[role="listitem"]',
        'div[role="main"] div[data-message-id]',
        'div[role="main"] div.adn',
        'div[role="main"] .a3s'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(element => {
        const text = getVisibleText(element);
        if (!text || text.length < 25) return;
        if (text.includes('PhishGuard AI') || element.closest('.phishguard-processed, .phishguard-tooltip')) return;

        const key = text.slice(0, 220);
        messages.push({ key, text, element });
    });

    return messages;
}

function getLocalMessageRisk(text) {
    const explanations = [];
    let score = 0;

    SPAM_MESSAGE_PATTERNS.forEach(pattern => {
        if (pattern.test(text)) {
            score += 0.12;
        }
    });

    const suspiciousLinks = Array.from(document.querySelectorAll('a[href]'))
        .map(link => link.getAttribute('href') || '')
        .filter(href => href && isSuspiciousLink(href));

    if (score > 0) {
        explanations.push('Spam-like wording detected in visible email content.');
    }

    if (suspiciousLinks.length > 0) {
        score += 0.2;
        explanations.push('Suspicious links are visible on this email page.');
    }

    return {
        riskScore: Math.min(score, 1),
        explanations
    };
}

function mergeSystemMessageResult(localResult, systemResult) {
    if (!systemResult || systemResult.error) return localResult;

    const systemScore = Number(systemResult.final_score ?? 0);
    const systemExplanations = Array.isArray(systemResult.explanations)
        ? systemResult.explanations
        : (systemResult.explanation ? [systemResult.explanation] : []);

    return {
        ...localResult,
        riskScore: Math.max(localResult.riskScore, systemScore),
        explanations: [...new Set([...localResult.explanations, ...systemExplanations])],
        systemResult,
        checkedBySystem: true,
        isSuspicious: localResult.isSuspicious || classifySystemThreat(systemResult)
    };
}

function checkMessageAgainstSystem(message, localResult) {
    if (pendingMessageChecks.has(message.key)) return;

    pendingMessageChecks.add(message.key);

    try {
        chrome.runtime.sendMessage({ action: 'analyzeEmailContent', content: message.text }, (systemResult) => {
            pendingMessageChecks.delete(message.key);

            if (chrome.runtime.lastError) {
                return;
            }

            const mergedResult = mergeSystemMessageResult(localResult, systemResult);
            messageResultsByKey.set(message.key, mergedResult);
            updateCombinedScanResults();

            if (mergedResult.isSuspicious) {
                markSuspiciousMessage(message.element, mergedResult);
            }

            notifyEmailFindings();
        });
    } catch (e) {
        pendingMessageChecks.delete(message.key);
    }
}

function scanEmailMessages() {
    findVisibleEmailMessages().forEach(message => {
        if (scannedMessageKeys.has(message.key)) return;
        scannedMessageKeys.add(message.key);

        const localRisk = getLocalMessageRisk(message.text);
        const result = {
            type: 'message',
            email: 'Visible Gmail message',
            domain: 'gmail message',
            subject: message.text.slice(0, 120),
            preview: message.text.slice(0, 240),
            riskScore: localRisk.riskScore,
            explanations: localRisk.explanations,
            isSuspicious: localRisk.riskScore >= 0.35
        };

        messageResultsByKey.set(message.key, result);
        updateCombinedScanResults();

        if (result.isSuspicious) {
            markSuspiciousMessage(message.element, result);
        }

        checkMessageAgainstSystem(message, result);
    });

    notifyEmailFindings();
}

function updateCombinedScanResults() {
    emailScanResults = [
        ...Array.from(emailResultsByAddress.values()),
        ...Array.from(messageResultsByKey.values())
    ];
}

function markSuspiciousMessage(element, result) {
    if (!element || element.classList.contains('phishguard-message-processed')) return;

    element.classList.add('phishguard-message-processed');
    element.style.outline = result.riskScore >= 0.6 ? '2px solid #DC2626' : '2px solid #F97316';
    element.style.outlineOffset = '-2px';
    element.title = `PhishGuard AI: ${result.riskScore >= 0.6 ? 'Critical email threat' : 'Suspicious email'} detected`;
}

// Automatically check a discovered email with your PHP/Python analysis system
function checkEmailAgainstSystem(email, localResult) {
    if (pendingEmailChecks.has(email)) return;

    pendingEmailChecks.add(email);

    try {
        chrome.runtime.sendMessage({ action: 'analyzeURL', url: email }, (systemResult) => {
            pendingEmailChecks.delete(email);

            if (chrome.runtime.lastError) {
                return;
            }

            const mergedResult = mergeSystemEmailResult(localResult, systemResult);
            emailResultsByAddress.set(email, mergedResult);
            emailScanResults = Array.from(emailResultsByAddress.values());

            if (mergedResult.isSuspicious) {
                markSuspiciousEmail(email, mergedResult);
            }

            notifyEmailFindings();
        });
    } catch (e) {
        pendingEmailChecks.delete(email);
    }
}

// Scan page for email addresses and check them
function scanEmails() {
    const foundEmails = findAllEmails();

    foundEmails.forEach(email => {
        if (scannedEmails.has(email)) return;
        scannedEmails.add(email);

        const domain = extractDomain(email);
        const localPart = extractLocalPart(email);

        if (!domain || !localPart) return;

        const spoofInfo = detectDomainSpoof(domain);
        const explanations = generateEmailExplanation(email, domain, localPart, spoofInfo);
        const riskScore = calculateEmailRiskScore(domain, localPart, spoofInfo);

        const result = {
            email: email,
            domain: domain,
            localPart: localPart,
            riskScore: riskScore,
            explanations: explanations,
            spoofInfo: spoofInfo,
            isSuspicious: riskScore > 0 || (spoofInfo !== null)
        };

        emailResultsByAddress.set(email, result);
        updateCombinedScanResults();

        // Mark visible occurrences on the page
        if (result.isSuspicious) {
            markSuspiciousEmail(email, result);
        }

        checkEmailAgainstSystem(email, result);
    });

    // Notify background script and popup about findings
    notifyEmailFindings();

    return emailScanResults;
}

// Get risk label from score
function getRiskLabel(score) {
    if (score >= 0.6) return 'critical';
    if (score >= 0.35) return 'high';
    if (score > 0) return 'medium';
    return 'safe';
}

// Get risk icon from score
function getRiskIcon(score) {
    if (score >= 0.6) return '🚨';
    if (score >= 0.35) return '⚠️';
    if (score > 0) return '⚡';
    return '✅';
}

// Create warning badge for suspicious emails
function createEmailBadge(result) {
    const badge = document.createElement('span');
    badge.className = 'phishguard-email-badge';
    badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin: 0 4px;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-weight: 600;
        cursor: pointer;
        vertical-align: middle;
        line-height: 1.5;
        border: 1px solid transparent;
        transition: all 0.15s ease;
        position: relative;
    `;

    const riskLabel = getRiskLabel(result.riskScore);
    const riskIcon = getRiskIcon(result.riskScore);

    if (riskLabel === 'critical') {
        badge.style.background = '#FEE2E2';
        badge.style.color = '#DC2626';
        badge.style.borderColor = '#FCA5A5';
    } else if (riskLabel === 'high') {
        badge.style.background = '#FFF7ED';
        badge.style.color = '#EA580C';
        badge.style.borderColor = '#FDBA74';
    } else if (riskLabel === 'medium') {
        badge.style.background = '#FEFCE8';
        badge.style.color = '#CA8A04';
        badge.style.borderColor = '#FDE047';
    }

    const brandNote = result.spoofInfo
        ? ` ${result.spoofInfo.brand.charAt(0).toUpperCase() + result.spoofInfo.brand.slice(1)} impersonation`
        : '';

    badge.textContent = `${riskIcon} Spam${brandNote}`;
    badge.title = result.explanations.join('\n');

    // Show tooltip on hover
    badge.addEventListener('mouseenter', (e) => {
        showEmailTooltip(e.target, result);
    });
    badge.addEventListener('mouseleave', () => {
        document.querySelectorAll('.phishguard-tooltip').forEach(t => t.remove());
    });

    return badge;
}

// Show detailed email tooltip
function showEmailTooltip(anchor, result) {
    // Remove existing tooltips
    document.querySelectorAll('.phishguard-tooltip').forEach(t => t.remove());

    const tooltip = document.createElement('div');
    tooltip.className = 'phishguard-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        background: #1E293B;
        color: #F1F5F9;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        z-index: 2147483647;
        max-width: 400px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.25);
        pointer-events: none;
        line-height: 1.6;
        border: 1px solid rgba(255,255,255,0.1);
    `;

    const riskLabel = getRiskLabel(result.riskScore);
    const riskIcon = getRiskIcon(result.riskScore);
    let riskColor = '#22C55E';
    if (riskLabel === 'critical') riskColor = '#EF4444';
    else if (riskLabel === 'high') riskColor = '#F97316';
    else if (riskLabel === 'medium') riskColor = '#EAB308';

    let html = `
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px;">
            <span style="color: ${riskColor};">${riskIcon}</span>
            Email Analysis
            <span style="color: ${riskColor}; float: right;">${(result.riskScore * 100).toFixed(0)}% risk</span>
        </div>
        <div style="word-break: break-all; color: #94A3B8; margin-bottom: 4px;">${escapeHtml(result.email)}</div>
    `;

    if (result.explanations.length > 0) {
        html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">`;
        result.explanations.forEach(exp => {
            html += `<div style="display: flex; gap: 4px; margin: 2px 0;">
                <span style="color: ${riskColor};">•</span>
                <span>${escapeHtml(exp)}</span>
            </div>`;
        });
        html += `</div>`;
    }

    if (result.isSuspicious && result.explanations.length === 0) {
        html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-style: italic; color: #94A3B8;">
            Suspicious domain pattern detected
        </div>`;
    }

    tooltip.innerHTML = html;

    // Position tooltip above the anchor
    const rect = anchor.getBoundingClientRect();
    let top = rect.top - tooltip.offsetHeight - 10;
    let left = rect.left;

    // Make sure tooltip stays within viewport
    if (top < 10) {
        top = rect.bottom + 10;
    }
    if (left + 400 > window.innerWidth) {
        left = Math.max(10, window.innerWidth - 410);
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    (document.body || document.documentElement).appendChild(tooltip);
}

// Mark suspicious emails on the page with badges
function markSuspiciousEmail(email, result) {
    const emailRegex = new RegExp(escapeRegex(email), 'gi');
    const scanRoot = document.body || document.documentElement;

    if (!scanRoot) {
        return;
    }

    // Walk all text nodes and wrap matches
    const walker = document.createTreeWalker(
        scanRoot,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    textNodes.forEach(textNode => {
        if (!emailRegex.test(textNode.textContent)) return;
        // Reset regex
        emailRegex.lastIndex = 0;

        const parent = textNode.parentElement;
        // Skip if already processed or inside script/style
        if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'TEXTAREA') return;
        if (parent.closest('input, textarea, [contenteditable="true"], .phishguard-tooltip, .phishguard-email-badge')) return;
        if (parent.closest('.phishguard-processed')) return;

        const fragment = document.createDocumentFragment();
        const parts = textNode.textContent.split(emailRegex);

        parts.forEach((part, i) => {
            if (part) {
                fragment.appendChild(document.createTextNode(part));
            }
            if (i < parts.length - 1) {
                const span = document.createElement('span');
                span.className = 'phishguard-processed';
                span.style.cssText = `
                    background: ${result.riskScore >= 0.6 ? '#FEE2E2' : result.riskScore >= 0.35 ? '#FFF7ED' : '#FEFCE8'};
                    border-radius: 2px;
                    padding: 1px 2px;
                    display: inline;
                `;
                span.textContent = email;
                fragment.appendChild(span);

                const badge = createEmailBadge(result);
                fragment.appendChild(badge);
            }
        });

        parent.replaceChild(fragment, textNode);
    });
}

// Escape HTML for tooltip safety
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Escape regex special chars
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Send email findings to background script
function notifyEmailFindings() {
    try {
        chrome.runtime.sendMessage({
            action: 'emailFindings',
            emails: emailScanResults,
            url: window.location.href
        });
    } catch (e) {
        // Background may not be available
    }
}

function normalizeUrl(url) {
    try {
        return new URL(url, window.location.href).href;
    } catch (e) {
        return null;
    }
}

function getLinkRisk(url) {
    const explanations = [];
    let riskScore = 0;

    if (isSuspiciousLink(url)) {
        riskScore += 0.45;
        explanations.push('Suspicious link pattern detected.');
    }

    if (url.startsWith('http://')) {
        riskScore += 0.2;
        explanations.push('No HTTPS.');
    }

    try {
        const parsed = new URL(url);
        if (hasSuspiciousTLD(parsed.hostname)) {
            riskScore += 0.2;
            explanations.push('Suspicious domain extension.');
        }
    } catch (e) {
        riskScore += 0.2;
        explanations.push('Invalid or unusual URL format.');
    }

    return {
        riskScore: Math.min(riskScore, 1),
        explanations,
        isSuspicious: riskScore >= 0.35
    };
}

function scanLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('javascript:') || href.startsWith('data:') || href.startsWith('#') || href.startsWith('mailto:')) {
            return;
        }

        const url = normalizeUrl(href);
        if (!url || linkResultsByUrl.has(url)) return;

        const linkText = (link.innerText || link.textContent || '').replace(/\s+/g, ' ').trim();
        const risk = getLinkRisk(url);
        const result = {
            url,
            text: linkText.slice(0, 80),
            riskScore: risk.riskScore,
            explanations: risk.explanations,
            isSuspicious: risk.isSuspicious
        };

        linkResultsByUrl.set(url, result);

        if (result.isSuspicious) {
            markElementAsThreaten(link);
        }
    });

    notifyLinkFindings();
}

function notifyLinkFindings() {
    const links = Array.from(linkResultsByUrl.values()).slice(0, 50);
    if (links.length === 0) return;

    try {
        chrome.runtime.sendMessage({
            action: 'linkFindings',
            links,
            url: window.location.href
        });
    } catch (e) {
        // Background may not be available
    }
}

// ==================== EXISTING CODE (LINK/FORM SCANNING) ====================

// Scan page for suspicious elements
function scanPage() {
    const threats = [];

    if (shouldScanEmailContent()) {
        scanEmails();
        scanEmailMessages();
    } else {
        emailScanResults = [];
        scannedEmails.clear();
        pendingEmailChecks.clear();
        emailResultsByAddress.clear();
        scannedMessageKeys.clear();
        pendingMessageChecks.clear();
        messageResultsByKey.clear();
        notifyEmailFindings();
    }

    scanLinks();

    // Scan all links
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && isSuspiciousLink(href)) {
            threats.push({
                type: 'link',
                url: href,
                element: link
            });
            markElementAsThreaten(link);
        }

        // Also check mailto links for suspicious email domains
        if (href && href.startsWith('mailto:')) {
            const email = href.replace(/^mailto:/i, '').split('?')[0];
            if (email) {
                const domain = extractDomain(email);
                if (domain) {
                    const spoofInfo = detectDomainSpoof(domain);
                    if (spoofInfo) {
                        threats.push({
                            type: 'email-link',
                            url: href,
                            email: email,
                            element: link
                        });
                        markElementAsThreaten(link);
                    }
                }
            }
        }
    });

    // Scan all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const action = form.getAttribute('action');
        if (action && isSuspiciousLink(action)) {
            threats.push({
                type: 'form',
                url: action,
                element: form
            });
            markElementAsThreaten(form);
        }
    });

    // Scan all input fields (look for email collection)
    const emailInputs = document.querySelectorAll('input[type="email"], input[type="text"][name*="email"]');
    emailInputs.forEach(input => {
        const formAction = input.closest('form')?.getAttribute('action');
        if (formAction && isSuspiciousLink(formAction)) {
            markElementAsThreaten(input);
        }
    });

    return threats;
}

// Check if link is suspicious
function isSuspiciousLink(url) {
    try {
        // Skip javascript, data, and internal links
        if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('#')) {
            return false;
        }

        // Check for common phishing patterns
        const suspiciousPatterns = [
            'bit.ly',
            'tinyurl',
            'shortened',
            'redirect',
            'verify',
            'confirm',
            'update-account',
            'security-alert',
            'urgent-action'
        ];

        const lowerUrl = url.toLowerCase();
        return suspiciousPatterns.some(pattern => lowerUrl.includes(pattern));
    } catch (e) {
        return false;
    }
}

// Mark element as threat
function markElementAsThreaten(element) {
    element.style.borderLeft = '3px solid #F44336';
    element.style.paddingLeft = '5px';
    element.title = '⚠️ Potential threat detected - PhishGuard AI';
}

// Add hover tooltips
document.addEventListener('mouseover', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')) {
        const href = e.target.getAttribute('href');
        if (isSuspiciousLink(href)) {
            showTooltip(e.target, 'Suspicious link detected!');
        }
    }
});

// Show tooltip
function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: fixed;
        background: #F44336;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
    `;

    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - 30) + 'px';

    (document.body || document.documentElement).appendChild(tooltip);

    setTimeout(() => tooltip.remove(), 3000);
}

// ==================== INITIALIZATION ====================

function startExtension() {
    scanPage();

    // Gmail and other webmail apps render sender data after the initial page load.
    // Run a few delayed scans so newly inserted email addresses are checked automatically.
    [1500, 4000, 8000].forEach(delay => {
        setTimeout(() => {
            scanPage();
        }, delay);
    });

    startObserver();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startExtension);
} else {
    startExtension();
}

// Rescan on dynamic content changes
const observer = new MutationObserver(() => {
    // Debounce rescan
    clearTimeout(observer.timeout);
    observer.timeout = setTimeout(() => {
        scanPage();
    }, 1000);
});

// Start observing only when a valid node exists
function startObserver() {
    const target = document.body || document.documentElement;
    if (target instanceof Node) {
        observer.observe(target, {
            childList: true,
            subtree: true
        });
    }
}
