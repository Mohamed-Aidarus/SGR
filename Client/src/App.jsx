import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExcelFileUpload from './Pages/InputFile';
import PredictionResultPage from './Pages/Result';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExcelFileUpload />} />
        <Route path="/results" element={<PredictionResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;