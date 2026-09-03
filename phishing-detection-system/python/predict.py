import sys
import json
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

models_dir = os.path.join(script_dir, '..', 'models')
if not os.path.exists(models_dir):
    os.makedirs(models_dir)

from fusion_engine import FusionEngine


def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input file'}))
        return
    
    input_file = os.path.normpath(sys.argv[1])
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            payload = json.load(f)
    except Exception as e:
        print(json.dumps({'error': f'Read failed: {str(e)}'}))
        return
    
    content = payload.get('content', '')
    input_type = payload.get('type', 'email')
    
    if not content:
        print(json.dumps({'error': 'Empty content'}))
        return
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    text_model = os.path.join(base_dir, 'models', 'text_ensemble.pkl')
    url_model = os.path.join(base_dir, 'models', 'url_rf.pkl')
    
    try:
        engine = FusionEngine(text_model, url_model)
        result = engine.analyze(content, input_type)
        print(json.dumps(result, ensure_ascii=False))
    except FileNotFoundError as e:
        print(json.dumps({'error': f'Model not found: {str(e)}. Run train_models.py first.'}))
    except Exception as e:
        print(json.dumps({'error': f'Analysis failed: {str(e)}'}))


if __name__ == '__main__':
    main()