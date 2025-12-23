import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {DebugErrorBoundary}  from './debug-boundary.jsx';          
createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <DebugErrorBoundary>
    <App />
  // {/* </StrictMode>, */}
  </DebugErrorBoundary>
)
