"""
Text Analysis Module with English + Swahili support
"""
import os
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

from utils import preprocess_text, tokenize_and_stem, extract_text_engineered_features

# Windows: Ensure NLTK data is in project directory
nltk_data_path = os.path.join(os.path.dirname(__file__), 'nltk_data')
if not os.path.exists(nltk_data_path):
    os.makedirs(nltk_data_path)
nltk.data.path.append(nltk_data_path)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', download_dir=nltk_data_path, quiet=True)
    nltk.download('punkt', download_dir=nltk_data_path, quiet=True)


class TextAnalyzer:
    def __init__(self, model_path='models/text_ensemble.pkl'):
        self.stemmer = PorterStemmer()
        
        # English stop words + Swahili common words + SMS abbreviations
        self.stop_words = set(stopwords.words('english'))
        self.stop_words.update({
            # English SMS
            'u', 'ur', 'lol', 'omg', 'btw', 'idk', 'smh', 'pls', 'thx',
            # Swahili common (low information)
            'na', 'ya', 'wa', 'kwa', 'ni', 'za', 'la', 'kama', 'pia', 
            'sana', 'tu', 'hii', 'hiyo', 'yake', 'yao', 'wao', 'sisi',
            'wewe', 'mimi', 'hapa', 'pale', 'hapo', 'zaidi', 'tena'
        })
        
        if not os.path.isabs(model_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, model_path)
        
        self.model_path = model_path
        self.model = None
        self._load_model()
    
    def _load_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
        else:
            raise FileNotFoundError(
                f"Model not found at {self.model_path}. Run train_models.py first."
            )
    
    def preprocess(self, text):
        cleaned = preprocess_text(text)
        return tokenize_and_stem(cleaned, self.stemmer, self.stop_words)
    
    def predict(self, text):
        if not text or not text.strip():
            return {
                'score': 0.0,
                'classification': 'legitimate',
                'explanations': ['Empty input provided.'],
                'features': {}
            }
        
        processed = self.preprocess(text)
        score = float(self.model.predict_proba([processed])[0][1]) if processed.strip() else 0.5
        
        features = extract_text_engineered_features(text)
        explanations = []
        
        # Urgency detection
        if features['urgency_count'] >= 2:
            explanations.append(f"Excessive urgency language ({features['urgency_count']} instances).")
        
        # Financial terms
        if features['financial_count'] >= 2:
            explanations.append(f"Financial/credential terms ({features['financial_count']} instances).")
        
        # Swahili-specific detection
        if features.get('has_swahili') and features['financial_count'] > 0:
            explanations.append("Swahili financial terms detected (common in local scams).")
        
        # Other indicators
        if features['exclamation_count'] > 3:
            explanations.append("Excessive exclamation marks.")
        if features['uppercase_ratio'] > 0.3:
            explanations.append("Too many capital letters.")
        if features['has_credential_phrase']:
            explanations.append("Credential request detected.")
        if features['length'] < 50 and features['urgency_count'] > 0:
            explanations.append("Short urgent message is suspicious.")
        
        if not explanations:
            explanations.append("Linguistic patterns match phishing." if score > 0.5 else "No suspicious indicators.")
        
        return {
            'score': round(score, 4),
            'classification': 'phishing' if score > 0.5 else 'legitimate',
            'explanations': explanations,
            'features': features
        }