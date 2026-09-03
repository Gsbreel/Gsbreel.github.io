import os
from text_analyzer import TextAnalyzer
from url_analyzer import URLAnalyzer
from utils import extract_urls_from_text


class FusionEngine:
    def __init__(self, text_model_path='models/text_ensemble.pkl', 
                 url_model_path='models/url_rf.pkl',
                 weights=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        if not os.path.isabs(text_model_path):
            text_model_path = os.path.join(base_dir, text_model_path)
        if not os.path.isabs(url_model_path):
            url_model_path = os.path.join(base_dir, url_model_path)
        
        self.text_analyzer = TextAnalyzer(text_model_path)
        self.url_analyzer = URLAnalyzer(url_model_path)
        self.weights = weights or {'text': 0.45, 'url': 0.45, 'context': 0.10}
    
    def analyze(self, text, input_type='email'):
        if not text:
            return {'error': 'No content', 'final_score': 0.0, 'classification': 'legitimate', 'risk_level': 'Unknown'}
        
        text_result = self.text_analyzer.predict(text)
        s_text = text_result['score']
        
        urls = extract_urls_from_text(text)
        url_results = []
        s_url = 0.5
        
        if urls:
            url_scores = []
            for url in urls:
                try:
                    res = self.url_analyzer.predict(url)
                    url_scores.append(res['score'])
                    url_results.append(res)
                except Exception as e:
                    url_results.append({'score': 0.5, 'classification': 'error', 'explanations': [str(e)], 'expanded_url': url})
            if url_scores:
                s_url = max(url_scores)
        
        context_boost = 0.05 if input_type == 'sms' and s_text > 0.6 else 0.0
        
        s_final = (self.weights['text'] * s_text + 
                   self.weights['url'] * s_url + 
                   self.weights['context'] * (0.5 + context_boost))
        s_final = max(0.0, min(1.0, s_final))
        
        if s_final >= 0.75: risk_level = "High Risk"
        elif s_final >= 0.5: risk_level = "Medium Risk"
        elif s_final >= 0.25: risk_level = "Low Risk"
        else: risk_level = "Safe"
        
        explanations = text_result['explanations'].copy()
        if url_results:
            most_suspicious = max(url_results, key=lambda x: x.get('score', 0))
            explanations.extend(most_suspicious.get('explanations', [])[:2])
        
        return {
            'final_score': round(s_final, 4),
            'classification': 'phishing' if s_final > 0.5 else 'legitimate',
            'risk_level': risk_level,
            'text_score': round(s_text, 4),
            'url_score': round(s_url, 4),
            'explanations': explanations,
            'url_details': url_results,
            'input_type': input_type,
            'urls_found': len(urls)
        }