import React from 'react'
import ReactDOM from 'react-dom/client'
import { initErService } from '@repo/service'
import App from './app/App'

initErService(import.meta.env.VITE_API_KEY)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
