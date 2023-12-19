import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App';
import { Amplify } from 'aws-amplify';
// import { AmplifyConfig } from './config/amplify-config'
import './index.css';

// Amplify.configure(AmplifyConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
    <App />
  {/* </React.StrictMode> */}
  </BrowserRouter>
);

