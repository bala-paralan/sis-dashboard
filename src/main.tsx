import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App } from './App'
import { LoginPage } from './components/auth/LoginPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/sis-dashboard">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
