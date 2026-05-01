import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// In a real app, this should come from process.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = '1013725732158-j906o5v3p573n670goh4l98d7p8h4e77.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
