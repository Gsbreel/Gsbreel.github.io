# 🛡️ PhishGuard AI Browser Extension - Complete Setup Guide

## ✅ What We've Created

Your browser extension is ready in: **`C:\xampp\htdocs\phishing-detection-system\browser-extension\`**

The extension **automatically links to your system** through:
- Your existing `/api/analyze.php` endpoint
- Same database for storing results
- User authentication via cookies/sessions

---

## 🚀 QUICK START (3 Steps)

### Step 1: Load Extension into Chrome

1. Open **Chrome** → go to `chrome://extensions/`
2. Toggle **"Developer mode"** ON (top-right corner)
3. Click **"Load unpacked"**
4. Select: `C:\xampp\htdocs\phishing-detection-system\browser-extension\`
5. ✅ Extension loads!

### Step 2: Create Database Table (Optional but Recommended)

Run this SQL in your phpMyAdmin or database manager:

```sql
CREATE TABLE IF NOT EXISTS extension_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    threat_url VARCHAR(2048),
    threat_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Or use the SQL file: `database/extension_reports.sql`

### Step 3: Test the Extension

1. Go to any website (e.g., Google.com)
2. Click the **PhishGuard AI icon** in your browser toolbar
3. You'll see:
   - ✅ Page safety status
   - Risk score percentage
   - Manual URL checker
   - Links to your system (Settings, History, Report)

---

## 🔗 How It's Linked to Your System

### Connection Points

**1. API Integration**
```
Extension sends: POST to /api/analyze.php
Your system analyzes and returns: Risk assessment
Results stored in: Database (analyses table)
```

**2. User Authentication**
```
Extension uses: Browser cookies/session
Same as: Your web login system
Authenticated as: Logged-in user
```

**3. Result Storage**
```
All analyses stored in: analyses table
Retrievable from: Your existing history.php
```

**4. Direct Links**
- Settings → Opens your system's settings page
- History → Opens your existing history.php
- Report → Sends to /api/extension-report.php (new endpoint)

---

## 📋 Extension Files Explained

| File | Purpose |
|------|---------|
| `manifest.json` | Extension config (permissions, icons, background script) |
| `popup.html` | The popup UI you see when clicking extension |
| `popup.js` | Popup logic + API calls to your /analyze.php |
| `background.js` | Background worker (stores page data, updates badge) |
| `content.js` | Scans web pages for suspicious links/forms |
| `styles.css` | Popup styling |
| `README.md` | Full documentation |

---

## 🎯 Features Working With Your System

### Real-Time Scanning ✓
- Scans every page you visit
- Marks suspicious links with red borders
- Shows warnings on hover

### Click to Analyze ✓
- Click extension icon for current page analysis
- Shows full threat assessment
- Risk score from your Python analyzer

### Manual Check ✓
- Enter any URL or email in popup
- Sent to your `/api/analyze.php`
- Results displayed instantly

### Data Flows to Your System ✓
```
Browser Extension
    ↓
analyze.php API
    ↓
Python analyzer (your ML model)
    ↓
Database storage
    ↓
Accessible in history.php
```

---

## 🔧 Configuration

### If Your API URL is Different

Edit these files:
- `popup.js` (line 5-7)
- `background.js` (line 5-7)

Change:
```javascript
const CONFIG = {
    API_URL: 'http://YOUR-DOMAIN.com/api/analyze.php',
    BACKEND_URL: 'http://YOUR-DOMAIN.com/'
};
```

### For HTTPS (Production)

Update URLs to use `https://` instead of `http://`

---

## 🖼️ Icons (Optional)

For better appearance, add images to `icons/` folder:
- `icon-16.png` (16×16 pixels)
- `icon-48.png` (48×48 pixels)
- `icon-128.png` (128×128 pixels)

**For now:** They're optional. Extension works without them.

---

## 📊 What Your System Will See

### In Database (analyses table)
```
New entries from: Extension icon clicks
Contains: URL analyzed, risk score, classification, timestamp
User: Logged-in user who ran analysis
```

### In history.php
```
All extension analyses appear here automatically
Mixed with web-based analyses
Can be exported/viewed like normal
```

### New Endpoint
```
POST /api/extension-report.php
For: Reporting false positives / threats
Stores in: extension_reports table (new)
```

---

## ✨ How to Know It's Working

1. **Icon appears** in Chrome toolbar ✓
2. **Click icon** → Shows current page safety ✓
3. **Red borders on links** → Suspicious links detected ✓
4. **Manual check works** → Type URL and click "Check" ✓
5. **Popup shows risk score** → Connected to your API ✓
6. **History button opens your history.php** → Linked! ✓

---

## 🔐 Security Tips

### For Development
- Current setup uses `http://localhost`
- Extension works without authentication

### For Production
1. Update to `https://`
2. Add CORS headers to `analyze.php`:
```php
header('Access-Control-Allow-Origin: chrome-extension://YOUR_EXTENSION_ID');
```
3. Verify user authentication in `analyze.php`
4. Rate limit API calls
5. Validate all inputs

---

## 🆘 Troubleshooting

### Extension icon doesn't appear
- Restart Chrome completely
- Go to `chrome://extensions/` and check it's enabled

### "API connection failed"
- Verify `http://localhost/phishing-detection-system/` works in browser
- Check PHP server is running
- Open DevTools (F12) → Console for errors

### Extension not detecting threats
- Refresh page after loading extension
- Check `content.js` console for errors
- Verify suspicious patterns match your needs

### Data not appearing in history.php
- Make sure you're logged in
- Data appears after you click the extension
- Check database table `analyses` has new entries

---

## 📞 Next Steps

1. **Load the extension** (Step 1 above)
2. **Test it** (click icon on any website)
3. **Check your database** - new entries should appear
4. **View in history.php** - see results there
5. **Customize** if needed (config, icons, features)

---

## 🎓 How Extension Communicates With Your System

```
┌─────────────────────────────────────┐
│   Chrome Browser                     │
│  ┌──────────────────────────────┐   │
│  │ PhishGuard AI Extension      │   │
│  │ - Scans pages               │   │
│  │ - Detects suspicious links  │   │
│  │ - Shows alerts              │   │
│  └──────────────────┬───────────┘   │
└─────────────────────┼────────────────┘
                      │
                      │ POST to
                      │ /api/analyze.php
                      ↓
┌─────────────────────────────────────┐
│   Your PhishGuard AI System          │
│  ┌──────────────────────────────┐   │
│  │ analyze.php                  │   │
│  │ - Receives URL/email         │   │
│  │ - Calls Python ML model      │   │
│  │ - Returns risk score         │   │
│  └──────────────────┬───────────┘   │
│                     │                 │
│                     ↓                 │
│  ┌──────────────────────────────┐   │
│  │ Database (analyses table)    │   │
│  │ - Stores all results         │   │
│  │ - Accessible from history.php   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

✅ **You're all set!** Your system and browser are now connected.

**Questions?** Check README.md in the browser-extension folder.
