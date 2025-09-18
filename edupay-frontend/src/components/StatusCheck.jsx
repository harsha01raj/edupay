import React, {useState} from 'react'
import { checkTransactionStatus } from '../api/transactions'

export default function StatusCheck(){
  const [id, setId] = useState('')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState(null)
  const run = async () => {
    setErr(null); setRes(null)
    try {
      const r = await checkTransactionStatus(id)
      setRes(r.data)
    } catch (e) {
      setErr(e.response?.data || e.message)
    }
  }
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <div className="flex gap-2">
        <input value={id} onChange={e=>setId(e.target.value)} placeholder="custom_order_id" className="p-2 border rounded flex-1"/>
        <button onClick={run} className="px-4 py-2 bg-blue-600 text-white rounded">Check</button>
      </div>
      {err && <pre className="mt-3 text-red-500">{JSON.stringify(err, null, 2)}</pre>}
      {res && <pre className="mt-3 bg-gray-100 dark:bg-gray-700 p-3 rounded">{JSON.stringify(res, null, 2)}</pre>}
    </div>
  )
}
