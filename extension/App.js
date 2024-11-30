import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAnalysisResult } from './store';

const App = () => {
  const [codeSnippet, setCodeSnippet] = useState('');
  const analysisResult = useSelector((state) => state.code.analysisResult);
  const dispatch = useDispatch();

  const handleAnalyze = async () => {
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeSnippet })
    });
    const data = await response.json();
    dispatch(setAnalysisResult(data.result));
  };

  return (
    <div>
      <h2>Code Review Assistant</h2>
      <textarea
        value={codeSnippet}
        onChange={(e) => setCodeSnippet(e.target.value)}
        placeholder="Paste your code here..."
      ></textarea>
      <button onClick={handleAnalyze}>Analyze Complexity</button>
      <pre>{analysisResult}</pre>
    </div>
  );
};

export default App;
