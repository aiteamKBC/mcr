// MCR file header: Frontend\src\main.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'sweetalert2/dist/sweetalert2.min.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

