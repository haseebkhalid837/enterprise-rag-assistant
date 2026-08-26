import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* =========================================================
   MOBILE VIEWPORT HEIGHT FIX

   Some mobile browsers (especially when the address bar
   shows/hides on scroll) don't handle 100vh / 100dvh
   reliably. This calculates the real visible height in
   pixels and stores it in a CSS variable, updated on
   resize/orientation change.
========================================================= */

function setRealViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}

setRealViewportHeight();

window.addEventListener('resize', setRealViewportHeight);
window.addEventListener('orientationchange', setRealViewportHeight);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
