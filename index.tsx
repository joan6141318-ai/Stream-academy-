
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Force reload timestamp: 2024-BIGO-UPDATE-V12-STABLE
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <App />
);
