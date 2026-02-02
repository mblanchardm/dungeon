import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './lib/ThemeContext.jsx'
import { I18nProvider } from './i18n/I18nContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// #region agent log
fetch('http://127.0.0.1:7245/ingest/5c757587-eaee-44d5-88e5-7f792addf5e3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:after-imports',message:'App entry loaded',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
// #endregion

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
