import React from 'react'
import ReactDOM from 'react-dom/client'
import { initErService, initClubService } from '@repo/service'
import App from './app/App'

initErService(import.meta.env.VITE_API_KEY)
initClubService(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_SERVICE_KEY)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
