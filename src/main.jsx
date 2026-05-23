import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // ← ADD THIS
import App from './App';
import './styles/index.css';  // or './styles.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>      {/* ← WRAP APP HERE */}
    <App />
  </BrowserRouter>
);