import os
import pickle
import pandas as pd
from utils import extract_url_features, resolve_short_url


class URLAnalyzer:
    def __init__(self, model_path='models/url_rf.pkl'):
        if not os.path.isabs(model_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, model_path)
        
        self.model_path = model_path
        self.model = None
        self.feature_names = [
            'url_length', 'hostname_length', 'path_length', 'query_length',
            'subdomain_count', 'has_ip', 'has_at', 'has_https', 'hyphen_count',
            'slash_count', 'dot_count', 'suspicious_tld', 'has_port',
            'url_entropy', 'domain_age', 'has_dns_record'
        ]
        self._load_model()
    
    def _load_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
        else:
            raise FileNotFoundError(f"Model not found at {self.model_path}. Run train_models.py first.")
    
    def predict(self, url, resolve_shorteners=True):
        if not url or not isinstance(url, str):
            return {'score': 0.5, 'classification': 'unknown', 'explanations': ['Invalid URL.'], 'features': {}, 'expanded_url': url}
        
        expanded = url
        if resolve_shorteners and any(s in url.lower() for s in ['bit.ly', 't.co', 'tinyurl', 'goo.gl']):
            expanded = resolve_short_url(url)
        
        features = extract_url_features(expanded)
        feature_vector = pd.DataFrame([features])[self.feature_names].fillna(0)
        
        score = float(self.model.predict_proba(feature_vector)[0][1])
        
        explanations = []
        if features['has_ip']: explanations.append("Contains IP address.")
        if features['suspicious_tld']: explanations.append("Suspicious TLD.")
        if features['domain_age'] != -1 and features['domain_age'] < 30: explanations.append(f"New domain ({features['domain_age']} days).")
        if features['subdomain_count'] > 3: explanations.append("Too many subdomains.")
        if features['has_at']: explanations.append("Contains @ symbol.")
        if features['url_entropy'] > 4.5: explanations.append("High entropy.")
        if not features['has_https']: explanations.append("No HTTPS.")
        if features['url_length'] > 75: explanations.append("Very long URL.")
        
        if not explanations:
            explanations.append("URL matches malicious patterns." if score > 0.5 else "No suspicious indicators.")
        
        return {
            'score': round(score, 4),
            'classification': 'malicious' if score > 0.5 else 'benign',
            'explanations': explanations,
            'features': features,
            'expanded_url': expanded
        }