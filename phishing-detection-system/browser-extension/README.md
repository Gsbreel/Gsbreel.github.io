# PhishGuard AI - Browser Extension

A Chrome browser extension that detects phishing emails, spam links, and malicious websites with real-time integration to your PhishGuard AI system.

## Features

✅ **Real-time Threat Detection**
- Automatically scans web pages for suspicious links and forms
- Analyzes URLs and emails against your PhishGuard AI backend
- Marks threats with visual indicators

✅ **Smart Risk Assessment**
- Risk scoring from 0-100%
- Classification: Safe, Suspicious, or Malicious
- Detailed threat explanations

✅ **Integrated Dashboard**
- Quick popup for current page analysis
- Manual URL/email checker
- Direct links to your system settings and history

✅ **Backend Integration**
- Connects to your existing `analyze.php` API
- Stores analysis results in your database
- Respects your system's authentication

## Installation

### Step 1: Prepare Extension Files
The extension files are already in: `/browser-extension/`

### Step 2: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (top right toggle)
3. Click **"Load unpacked"**
4. Navigate to: `C:\xampp\htdocs\phishing-detection-system\browser-extension\`
5. Select the folder and click **"Open"**

### Step 3: Configure API Endpoint

Edit `popup.js` and `background.js` if your API URL differs:

```javascript
const CONFIG = {
    API_URL: 'http://localhost/phishing-detection-system/api/analyze.php',
    BACKEND_URL: 'http://localhost/phishing-detection-system/'
};
```

### Step 4: Create Icons (Optional)

Create an `icons/` folder with these image files:
- `icon-16.png` (16×16 pixels)
- `icon-48.png` (48×48 pixels)  
- `icon-128.png` (128×128 pixels)

**Or** temporarily disable icons in `manifest.json`:
```json
"icons": {}
```

## How It Works

### 1. Page Scanning
- Loads on every webpage
- Scans for suspicious links and forms
- Marks threats with red border

### 2. Real-time Analysis
- Click extension icon to analyze current page
- Extension sends URL to your `/api/analyze.php` endpoint
- Receives risk assessment and threat details

### 3. Manual Checking
- Enter any URL or email in popup
- Get instant threat analysis
- Results stored in your database

### 4. Integration Points

**Backend API Connection:**
```
POST /api/analyze.php
Parameters:
  - type: 'url' or 'email'
  - content: the URL or email to analyze

Response:
  {
    "risk_level": "high|medium|low",
    "classification": "malicious|suspicious|safe",
    "final_score": 0.75,
    "explanation": "...",
    "url_details": [...],
    "analysis_id": 123
  }
```

## API Requirements

Your system must have:
- ✅ `/api/analyze.php` - Analysis endpoint (already exists)
- ✅ Database for storing results (already exists)
- ✅ Authentication system (uses cookies/sessions)

## File Structure

```
browser-extension/
├── manifest.json        # Extension configuration
├── popup.html          # Popup UI
├── popup.js            # Popup functionality & API calls
├── background.js       # Background service worker
├── content.js          # Page scanning script
├── styles.css          # Styling
├── icons/              # Extension icons
└── README.md           # This file
```

## Troubleshooting

### Extension shows CORS error
- Make sure your `/api/analyze.php` has CORS headers or uses same origin
- Add to `analyze.php`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
```

### "API connection failed"
- Verify `http://localhost/phishing-detection-system/` is accessible
- Check PHP server is running
- Open browser console (F12) for detailed errors

### Extension not detecting threats
- Make sure `content.js` is scanning correctly
- Check browser console for JavaScript errors
- Verify threat patterns in `content.js` match your use cases

## Updates & Maintenance

To update the extension:
1. Edit files in `/browser-extension/`
2. Go to `chrome://extensions/`
3. Click refresh button next to PhishGuard AI
4. Changes take effect immediately

## Security Notes

⚠️ **For Production:**
- Update `API_URL` to use HTTPS (`https://...`)
- Add authentication tokens to requests
- Validate all inputs server-side
- Use secure cookie settings
- Implement rate limiting on `/api/analyze.php`

## Support

- **Settings:** Click ⚙️ in popup
- **History:** Click 📋 in popup to view past analyses
- **Report:** Click 🚨 to report false positives

---

**Version:** 1.0.0  
**System:** PhishGuard AI  
**Created:** 2024
