import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ActivityProvider } from './context/ActivityContext';
import ToastContainer from './components/ui/Toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <ToastProvider>
        <AuthProvider>
          <ActivityProvider>
            <App />
          </ActivityProvider>
        </AuthProvider>
        <ToastContainer />
      </ToastProvider>
    </Router>
  </React.StrictMode>
);
