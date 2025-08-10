from flask import Flask, request, jsonify, Response
from gensim.models import KeyedVectors
from flask_cors import CORS
import numpy as np
import json

app = Flask(__name__)
CORS(app)

# モデル読み込み（起動時に一度だけ）
word2vec_model = KeyedVectors.load_word2vec_format('./entity_vector.model.bin', binary=True)
#word2vec_model = KeyedVectors.load_word2vec_format(gutenberg.sents(), vector_size=100, seed=0)

@app.route('/api/calc', methods=['POST'])
def calc():
    data = request.get_json()
    expr = data.get('expression', '')
    topn = int(data.get('topn', 5))

    # 演算子でパース（+/- のみ対応）
    tokens = expr.replace('+', ' + ').replace('-', ' - ').split()
    print(f"Parsed tokens: {tokens}")

    if not tokens:
        return Response(json.dumps({'error': '式が空です'}, ensure_ascii=False), mimetype='application/json', status=400)
    try:
        positives = []
        negatives = []
        op = '+'
        for token in tokens:
            if token in ['+', '-']:
                op = token
            else:
                if token not in word2vec_model:
                    return Response(json.dumps({'error': f'単語が見つかりません: {token}'}, ensure_ascii=False), mimetype='application/json', status=400)
                if op == '+':
                    positives.append(token)
                elif op == '-':
                    negatives.append(token)

        print(f"Positives: {positives}, Negatives: {negatives}")

        # most_similar にpositiveとnegativeを渡す
        results = word2vec_model.most_similar(positive=positives, negative=negatives, topn=topn)
        return jsonify(results)

    except Exception as e:
        return Response(json.dumps({'error': str(e)}, ensure_ascii=False), mimetype='application/json', status=400)


if __name__ == '__main__':
    app.run(debug=True)
