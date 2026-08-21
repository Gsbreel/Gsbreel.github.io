import os
import pickle
import random
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

from utils import preprocess_text, tokenize_and_stem, extract_url_features

nltk_data_path = os.path.join(os.path.dirname(__file__), 'nltk_data')
if not os.path.exists(nltk_data_path):
    os.makedirs(nltk_data_path)
nltk.data.path.append(nltk_data_path)

nltk.download('stopwords', download_dir=nltk_data_path, quiet=True)
nltk.download('punkt', download_dir=nltk_data_path, quiet=True)

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
models_dir = os.path.join(base_dir, 'models')
os.makedirs(models_dir, exist_ok=True)


def train_text_model():
    print("=" * 50)
    print("Training Text Model...")
    print("=" * 50)
    
    np.random.seed(42)
    random.seed(42)
    
    phishing_templates = [
        "URGENT: Your account suspended. Verify at {link}.",
        "Congratulations! You won ${amount}. Click now!!!",
        "Unauthorized login detected. Confirm password now.",
        "Your {service} account needs verification. Update urgent.",
        "Security alert: Bank account locked. Verify PIN.",
        "Free gift! Limited time. Click to redeem!!!",
        "Account compromised. Reset password via {link}",
        "New voicemail. Listen at {link}",
        "Tax refund available. Provide SSN immediately.",
        "Mobile money blocked. Verify to restore access.",
        "{service} subscription expired. Renew at {link}",
        "Suspicious activity. Login to verify identity.",
        "You received ${amount}. Accept at {link}",
        "Account verification required. 24 hours to comply.",
        "WINNER! Your number selected. Claim prize now!",
        "HARAKA! {service} yako imefungwa. Thibitisha {link}",
        "Hongera! Umeshinda TZS {amount}. Bonyeza {link} sasa!",
        "Tuma namba yako na siri kupokea pesa yako.",
        "Dharura: Akaunti yako inahitaji uthibitisho haraka.",
        "Hatari: Mtu anajaribu kuingia akaunti yako. Thibitisha sasa."
    ]
    
    legitimate_templates = [
        "Meeting rescheduled to {time} in {location}.",
        "Please review attached quarterly report.",
        "Your order #{order} shipped. Arrives {date}.",
        "Happy Birthday! Have a wonderful day.",
        "Team lunch scheduled for {day} at {location}.",
        "Send updated spreadsheet by end of day?",
        "Your {service} subscription renews next month.",
        "Reminder: Dentist appointment {day} at {time}.",
        "Package delivered to front porch at {time}.",
        "See you at the gym later?",
        "Thanks for your application. Review in 5 days.",
        "Your salary for {month} deposited.",
        "Meeting minutes attached for review.",
        "Conference call scheduled for {time}.",
        "Library book due for return on {date}.",
        "Malipo yako ya TZS {amount} yamekamilika. Asante.",
        "Mpokeaji {name} amepokea pesa. Salio lako ni TZS {amount}.",
        "Huduma ya {service} inaendelea vizuri. Hakuna tatizo.",
        "Mkopo wako wa TZS {amount} umeidhinishwa. Tafadhali tembelea tawi letu."
    ]
    
    services = ['PayPal', 'M-Pesa', 'Tigo Pesa', 'Bank', 'Netflix', 'Amazon', 'Google']
    links = ['http://fake.com', 'http://verify-now.tk', 'http://bit.ly/abc123']
    
    phishing_samples, legitimate_samples = [], []
    
    for template in phishing_templates:
        for _ in range(20):
            phishing_samples.append(template.format(
                link=random.choice(links),
                amount=random.randint(100, 5000),
                service=random.choice(services),
                time=f"{random.randint(1,12)}:{random.randint(0,59):02d}",
                location=random.choice(['Room A', 'Room B', 'Downtown']),
                day=random.choice(['Monday', 'Tuesday', 'Friday']),
                date=f"2024-{random.randint(1,12)}-{random.randint(1,28)}",
                month=random.choice(['Jan', 'Feb', 'Mar']),
                order=str(random.randint(10000, 99999))
            ))
    
    for template in legitimate_templates:
        for _ in range(20):
            legitimate_samples.append(template.format(
                time=f"{random.randint(1,12)}:{random.randint(0,59):02d}",
                location=random.choice(['Room A', 'Room B', 'Downtown']),
                day=random.choice(['Monday', 'Tuesday', 'Friday']),
                date=f"2024-{random.randint(1,12)}-{random.randint(1,28)}",
                month=random.choice(['Jan', 'Feb', 'Mar']),
                order=str(random.randint(10000, 99999)),
                service=random.choice(services)
            ))
    
    texts = phishing_samples + legitimate_samples
    labels = [1] * len(phishing_samples) + [0] * len(legitimate_samples)
    df = pd.DataFrame({'text': texts, 'label': labels})
    
    stemmer = PorterStemmer()
    stop_words = set(stopwords.words('english'))
    df['processed'] = df['text'].apply(lambda x: tokenize_and_stem(preprocess_text(x), stemmer, stop_words))
    
    X_train, X_test, y_train, y_test = train_test_split(df['processed'], df['label'], test_size=0.2, random_state=42, stratify=df['label'])
    
    nb = MultinomialNB(alpha=0.1)
    svm = SVC(kernel='linear', C=1.0, probability=True, random_state=42)
    rf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
    
    ensemble = VotingClassifier(estimators=[('nb', nb), ('svm', svm), ('rf', rf)], voting='soft')
    pipeline = Pipeline([('tfidf', TfidfVectorizer(max_features=3000, ngram_range=(1, 2), min_df=2)), ('ensemble', ensemble)])
    
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    print(f"\n✓ Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))
    
    with open(os.path.join(models_dir, 'text_ensemble.pkl'), 'wb') as f:
        pickle.dump(pipeline, f)
    print(f"✓ Saved text model\n")


def train_url_model():
    print("=" * 50)
    print("Training URL Model...")
    print("=" * 50)
    
    np.random.seed(42)
    
    benign_urls = [
        "https://www.google.com/search?q=machine+learning",
        "https://github.com/user/project",
        "https://www.paypal.com/signin",
        "https://stackoverflow.com/questions/12345",
        "https://www.who.int/news-room",
        "https://edition.cnn.com/world",
        "https://www.m-pesa.com/about",
        "https://crdbbank.co.tz/personal-banking",
        "https://www.youtube.com/watch?v=abc123",
        "https://www.linkedin.com/in/profile"
    ] * 150
    
    malicious_urls = [
        "http://192.168.1.1/paypal/login.html",
        "http://verify-paypal.tk/secure/login.php",
        "https://bit.ly/3xMalicious",
        "http://bank-update.ml/verify",
        "http://login-appleid.verify.com.fake-site.com",
        "http://mpesa-verify.co.tz/login",
        "https://tinyurl.com/y7malicious",
        "http://secure-login.bank.com.evil.ru/phish",
        "http://update-info-now.cf/verify",
        "http://192.168.0.1/bank/login"
    ] * 150
    
    urls = benign_urls + malicious_urls
    labels = [0] * len(benign_urls) + [1] * len(malicious_urls)
    df = pd.DataFrame({'url': urls, 'label': labels})
    
    feature_rows = [extract_url_features(url) for url in df['url']]
    X = pd.DataFrame(feature_rows).fillna(0)
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    rf = RandomForestClassifier(n_estimators=150, max_depth=20, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    print(f"\n✓ Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(classification_report(y_test, y_pred, target_names=['Benign', 'Malicious']))
    
    importances = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
    print("\nTop Features:\n", importances.head())
    
    with open(os.path.join(models_dir, 'url_rf.pkl'), 'wb') as f:
        pickle.dump(rf, f)
    print(f"\n✓ Saved URL model\n")


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("PHISHING DETECTION - MODEL TRAINING")
    print("Windows 10 Version")
    print("=" * 50 + "\n")
    
    try:
        train_text_model()
        train_url_model()
        print("=" * 50)
        print("✓ ALL MODELS TRAINED SUCCESSFULLY!")
        print(f"✓ Location: {models_dir}")
        print("=" * 50)
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")