"""
Utility functions with English + Swahili support
"""
import re
import math
import json
import urllib.parse
from datetime import datetime
import socket
import requests

try:
    import whois
    WHOIS_AVAILABLE = True
except ImportError:
    WHOIS_AVAILABLE = False


# ==================== SWAHILI LANGUAGE SUPPORT ====================

# English + Swahili urgency indicators
URGENCY_WORDS = {
    # English
    'urgent', 'immediate', 'suspend', 'verify', 'alert', 
    'warning', 'now', 'today', 'limited', 'expired', 
    'locked', 'blocked', 'restricted', 'hurry', 'quick',
    # Swahili
    'haraka', 'sasa', 'leo', 'marufuku', 'zimefungwa',
    'thibitisha', 'hakikisha', 'hatari', 'dharura', 'muda',
    'fungwa', 'sitishwa', 'mara', 'papohapo', 'harakati'
}

# English + Swahili financial terms
FINANCIAL_WORDS = {
    # English
    'account', 'password', 'pin', 'money', 'payment', 
    'transaction', 'bank', 'credit', 'debit', 'card', 
    'balance', 'transfer', 'mobile', 'cash', 'withdraw',
    # Swahili
    'pesa', 'malipo', 'akaunti', 'namba', 'siri', 'nywila',
    'tuma', 'pokea', 'benki', 'salio', 'fedha', 'mkopo',
    'toa', 'weka', 'huduma',
    # Brand names (Tanzania)
    'mpesa', 'tigo', 'airtel', 'halopesa', 'tpesa', 
    'vodacom', 'azam', 'crdb', 'nmb', 'equity', 
    'amana', 'dtb', 'exim', 'kcb'
}

# English + Swahili credential request phrases
CREDENTIAL_PHRASES = [
    # English
    'verify your account', 'update your details', 
    'confirm your pin', 'reset your password',
    'login to verify', 'validate your account',
    'enter your pin', 'provide your password',
    # Swahili
    'thibitisha akaunti', 'hakikisha namba', 
    'tuma pesa', 'weka namba yako', 'ingiza siri',
    'badilisha nywila', 'pokea zawadi', 'pesa yako',
    'malipo yako', 'namba ya siri', 'kumbukumbu ya siri',
    'tuma taarifa zako', 'thibitisha utambulisho'
]


def preprocess_text(text):
    """Clean and normalize text for NLP analysis."""
    if not text:
        return ""
    
    text = text.lower()
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'[^a-z\s]', '', text)  # Keep only letters and spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def tokenize_and_stem(text, stemmer, stop_words):
    """Tokenize text and apply stemming."""
    tokens = text.split()
    processed = []
    for token in tokens:
        if token not in stop_words and len(token) > 2:
            processed.append(stemmer.stem(token))
    return ' '.join(processed)


def extract_text_engineered_features(text):
    """Extract hand-crafted features from raw text - with Swahili support."""
    original_text = str(text)
    lower_text = original_text.lower()
    
    features = {
        'urgency_count': sum(1 for w in URGENCY_WORDS if w in lower_text),
        'financial_count': sum(1 for w in FINANCIAL_WORDS if w in lower_text),
        'exclamation_count': original_text.count('!'),
        'question_count': original_text.count('?'),
        'uppercase_ratio': sum(1 for c in original_text if c.isupper()) / max(len(original_text), 1),
        'length': len(original_text),
        'word_count': len(original_text.split()),
        'has_credential_phrase': any(phrase in lower_text for phrase in CREDENTIAL_PHRASES),
        # Swahili-specific: check for mixed language (common in Tanzania SMS)
        'has_swahili': any(w in lower_text for w in ['pesa', 'haraka', 'tuma', 'akaunti', 'namba', 'siri'])
    }
    return features


def extract_url_features(url):
    """Extract lexical and host-based features from a URL."""
    features = {}
    
    try:
        parsed = urllib.parse.urlparse(str(url).lower().strip())
        hostname = parsed.hostname or ''
        path = parsed.path or ''
        query = parsed.query or ''
    except Exception:
        hostname = path = query = ''
    
    # Lexical features
    features['url_length'] = len(url)
    features['hostname_length'] = len(hostname)
    features['path_length'] = len(path)
    features['query_length'] = len(query)
    features['subdomain_count'] = hostname.count('.') if hostname else 0
    features['has_ip'] = 1 if re.match(r'^\d+\.\d+\.\d+\.\d+$', hostname) else 0
    features['has_at'] = 1 if '@' in url else 0
    features['has_https'] = 1 if parsed.scheme == 'https' else 0
    features['hyphen_count'] = url.count('-')
    features['slash_count'] = url.count('/')
    features['dot_count'] = url.count('.')
    features['suspicious_tld'] = 1 if hostname.endswith(('.tk', '.ml', '.cf', '.ga', '.top', '.xyz')) else 0
    features['has_port'] = 1 if parsed.port else 0
    
    # Entropy calculation
    if len(url) > 0:
        prob = [float(url.count(c)) / len(url) for c in dict.fromkeys(list(url))]
        entropy = -sum([p * math.log2(p) for p in prob if p > 0])
        features['url_entropy'] = round(entropy, 4)
    else:
        features['url_entropy'] = 0
    
    # Host-based features
    features['domain_age'] = -1
    features['has_dns_record'] = 0
    
    if hostname and not features['has_ip']:
        try:
            socket.gethostbyname(hostname)
            features['has_dns_record'] = 1
        except socket.gaierror:
            pass
        
        if WHOIS_AVAILABLE:
            try:
                domain_info = whois.whois(hostname)
                creation_date = domain_info.creation_date
                if isinstance(creation_date, list):
                    creation_date = creation_date[0]
                if creation_date and isinstance(creation_date, datetime):
                    features['domain_age'] = (datetime.now() - creation_date).days
            except Exception:
                pass
    
    return features


def resolve_short_url(url, timeout=5):
    """Expand shortened URLs to final destination."""
    try:
        response = requests.head(url, allow_redirects=True, timeout=timeout)
        return response.url
    except Exception:
        return url


def extract_urls_from_text(text):
    """Extract all URLs from text using regex."""
    url_pattern = re.compile(
        r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    )
    return url_pattern.findall(text)