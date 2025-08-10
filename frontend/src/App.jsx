import { useState } from 'react';
import './App.css';

const OPERATORS = [
  { label: '+', value: '+' },
  { label: '-', value: '-' },
];

function App() {
  const [expression, setExpression] = useState('');
  const [topn, setTopn] = useState(5);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('ja');

  // 入力欄に演算子を追加
  const handleAddOperator = (op) => {
    let trimmed = expression.trim();
    if (!trimmed) return;
    // 末尾が演算子なら置き換え
    if (["+","-"].includes(trimmed.split(' ').slice(-1)[0])) {
      trimmed = trimmed.split(' ').slice(0, -1).join(' ');
    }
    setExpression(trimmed + ' ' + op + ' ');
  };

  // クリア
  const handleClear = () => {
    setExpression('');
    setResult(null);
    setError('');
  };

  // 計算
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    const expr = expression.trim();
    if (!expr) {
      setError('式を入力してください');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr, topn, model })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        // setExpression('');
      } else {
        setError(data.error || 'APIエラー');
      }
    } catch (err) {
      setError('サーバーに接続できません');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="tech-desc">
        <strong>Word2Vecとは？</strong><br />
        <span style={{fontSize:'0.98em'}}>
          Word2Vecは、単語を「意味的な特徴を持つベクトル（数値の配列）」に変換する機械学習モデルである。
          文章中で似た文脈に現れる単語同士が、近いベクトル空間上の位置になるように学習されて、king - man + woman ≒ queen」のような意味的な演算が可能になる。
        </span>
        <hr style={{margin:'16px 0'}}/>
      </div>
      <div className="app-mat">
        <h1>単語を入力して演算してみよう</h1>
        <form className="math-form" onSubmit={handleSubmit}>
          <div className="expr-builder">
            <input
              type="text"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder="例: king - man + woman"
              className="word-input"
              style={{minWidth: 220}}
              autoFocus
            />
            <div className="op-btns">
              {OPERATORS.map(op => (
                <button
                  key={op.value}
                  type="button"
                  className="op-btn"
                  onClick={() => handleAddOperator(op.value)}
                  disabled={!expression.trim()}
                >{op.label}</button>
              ))}
            </div>
          </div>
          <div className="topn-row">
            <label>Top-N: </label>
            <input
              type="number"
              value={topn}
              min={1}
              max={20}
              onChange={e => setTopn(Number(e.target.value))}
              className="topn-input"
            />
          </div>
          <div className="form-btns">
            <button type="submit" className="calc-btn" disabled={loading}>{loading ? '計算中...' : '計算'}</button>
            <button type="button" className="clear-btn" onClick={handleClear}>クリア</button>
          </div>
        </form>
        {error && <div className="error-msg">{error}</div>}
        {result && Array.isArray(result) && (
          <div className="result-card">
            <h2>結果</h2>
            <ol>
              {result.map(([word, score], idx) => (
                <li key={idx}>{word}（スコア: {score.toFixed(4)}）</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

