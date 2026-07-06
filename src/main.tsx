import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Initialize the shape registry BEFORE React renders so all sidebar components
// see a fully populated registry on their first render pass.
import { initializeShapeRegistry } from './shapes';
initializeShapeRegistry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
