import React from 'react'
import ReactDOM from 'react-dom/client'
import './globals.css'
import App from './App.jsx'
import { StorageContext, storage } from './services/storage.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StorageContext.Provider value={storage}>
      <App />
    </StorageContext.Provider>
  </React.StrictMode>,
)
