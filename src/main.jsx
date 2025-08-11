import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DevAuthWrapper from './auth/DevAuthWrapper'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DevAuthWrapper>
      <App />
    </DevAuthWrapper>
  </StrictMode>,
)
