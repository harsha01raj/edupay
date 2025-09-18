import React, { useState } from 'react'
import SchoolSelector from '../components/SchoolSelector'
import TransactionsPage from './TransactionsPage' // reuse but prefill query - simpler: we'll navigate to /?school=ID
import { useNavigate } from 'react-router-dom'

export default function SchoolTransactionsPage(){
  const navigate = useNavigate()
  const [selected, setSelected] = useState('')
  const go = () => {
    if (!selected) return
    navigate(`/?school=${encodeURIComponent(selected)}&page=1`)
  }
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 p-4 dark:bg-gray-700">Transactions by School</h2>
      <div className="mb-4 flex gap-2 bodder p-4 rounded bg-gray-50 dark:bg-gray-700">
        <SchoolSelector value={selected} onChange={setSelected} className="text-black border-2" />
        <button onClick={go} className="px-4 py-2 bg-blue-600 text-white rounded">Show</button>
      </div>
      <p className="text-sm text-gray-600">After clicking Show you will be redirected to the filtered Transactions view.</p>
    </div>
  )
}
