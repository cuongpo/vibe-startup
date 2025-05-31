import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import { ApiKeyProvider } from './context/ApiKeyContext';
import './App.css';

function App() {
  return (
    <ApiKeyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </Router>
    </ApiKeyProvider>
  );
}

export default App;
