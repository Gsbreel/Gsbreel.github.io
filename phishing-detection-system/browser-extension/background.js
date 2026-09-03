// PhishGuard AI - Background Service Worker

const CONFIG = {
    API_URL: 'http://localhost/phishing-detection-system/api/analyze.php'
};

// Store latest email findings per tab
const tabEmailFindings = {};
const tabLinkFindings = {};

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeURL') {
        analyzeContent(request.url).then(result => {
            sendResponse(result);
        });
        return true;
    }

    if (request.action === 'analyzeEmailContent') {
        analyzeContent(request.content, 'email').then(result => {
            sendResponse(result);
        });
        return true;
    }

    // Handle email findings from content script
    if (request.action === 'emailFindings') {
        const tabId = sender.tab?.id;
        if (tabId) {
            tabEmailFindings[tabId] = {
                emails: request.emails,
                url: request.url,
                timestamp: Date.now()
            };
            // Forward to popup if open
            try {
                chrome.runtime.sendMessage({
                    action: 'updateEmailFindings',
                    emails: request.emails,
                    url: request.url
                });
            } catch (e) {
                // Popup may not be open
            }
        }
        return;
    }

    if (request.action === 'linkFindings') {
        const tabId = sender.tab?.id;
        if (tabId) {
            tabLinkFindings[tabId] = {
                links: request.links,
                url: request.url,
                timestamp: Date.now()
            };
            try {
                chrome.runtime.sendMessage({
                    action: 'updateLinkFindings',
                    links: request.links,
                    url: request.url
                });
            } catch (e) {
                // Popup may not be open
            }
        }
        return;
    }

    // Handle popup requesting current email findings
    if (request.action === 'getEmailFindings') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                const tabId = tabs[0].id;
                const findings = tabEmailFindings[tabId] || null;
                sendResponse({ findings: findings });
            } else {
                sendResponse({ findings: null });
            }
        });
        return true;
    }

    if (request.action === 'getLinkFindings') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                const tabId = tabs[0].id;
                const findings = tabLinkFindings[tabId] || null;
                sendResponse({ findings: findings });
            } else {
                sendResponse({ findings: null });
            }
        });
        return true;
    }
});

async function analyzeContent(content, forcedType = null) {
    try {
        const formData = new FormData();
        const isEmail = content.includes('@');
        formData.append('type', forcedType || (isEmail ? 'email' : 'url'));
        formData.append('content', content);

        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: formData
        });

        return await response.json();
    } catch (error) {
        return { error: 'Analysis failed: ' + error.message };
    }
}

// Clean up tab data when tabs are closed
if (chrome.tabs && chrome.tabs.onRemoved) {
    chrome.tabs.onRemoved.addListener((tabId) => {
        delete tabEmailFindings[tabId];
        delete tabLinkFindings[tabId];
    });
}
