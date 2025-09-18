// src/App.jsx
import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import TransactionsPage from './pages/TransactionsPage'
import SchoolTransactionsPage from './pages/SchoolTransactionsPage'
import StatusCheckPage from './pages/StatusCheckPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DarkToggle from './components/DarkToggle'
import RequireAuth from './components/RequireAuth'
import UserMenu from './components/UserMenu'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">EduPay Dashboard</Link>
          <Link to="/" className="text-sm text-gray-600 dark:text-gray-300">Transactions</Link>
          <Link to="/school" className="text-sm text-gray-600 dark:text-gray-300">By School</Link>
          <Link to="/status-check" className="text-sm text-gray-600 dark:text-gray-300">Check Status</Link>
        </div>
        <div className="flex items-center gap-4">
          <DarkToggle />
          <UserMenu />
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />

          {/* Protected routes */}
          <Route path="/" element={
            <RequireAuth><TransactionsPage/></RequireAuth>
          } />
          <Route path="/school" element={
            <RequireAuth><SchoolTransactionsPage/></RequireAuth>
          } />
          <Route path="/status-check" element={
            <RequireAuth><StatusCheckPage/></RequireAuth>
          } />

          {/* fallback */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </main>
    </div>
  )
}
