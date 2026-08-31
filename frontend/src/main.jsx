import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { ScanFlowProvider } from './contexts/ScanFlowContext.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ScanFlowProvider>
            <App />
          </ScanFlowProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
