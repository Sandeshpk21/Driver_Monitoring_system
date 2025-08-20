import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add error handling for development
const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found. Check index.html</div>';
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px; font-family: monospace;">
        <h2>Failed to load application</h2>
        <pre>${error}</pre>
        <p>Check console for more details</p>
      </div>
    `;
  }
}