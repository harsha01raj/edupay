import React from 'react'

export default function TransactionsTable({ rows, loading, sortField, sortOrder, onSortChange }) {
  const headers = [
    { key:'collect_id', label:'Collect ID' },
    { key:'school_id', label:'School ID' },
    { key:'gateway', label:'Gateway' },
    { key:'order_amount', label:'Order Amount' },
    { key:'transaction_amount', label:'Txn Amount' },
    { key:'status', label:'Status' },
    { key:'custom_order_id', label:'Custom Order ID' },
  ]

  const handleSort = (key) => {
    const next = sortField === key && sortOrder === 'desc' ? 'asc' : 'desc'
    onSortChange(key, next)
  }

  return (
    <div className="overflow-auto bg-white dark:bg-gray-800 rounded shadow">
      <table className="min-w-full">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h.key} className="px-4 py-2 text-left cursor-pointer" onClick={()=>handleSort(h.key)}>
                <div className="flex items-center gap-2">
                  <span>{h.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="p-4">Loading...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={7} className="p-4">No results</td></tr>
          ) : rows.map(r => (
            <tr key={r.collect_request_id || r.collect_id || r._id} className="border-t last:border-b">
              <td className="px-4 py-2">{r.collect_request_id || r.collect_id}</td>
              <td className="px-4 py-2">{r.school_id}</td>
              <td className="px-4 py-2">{r.gateway}</td>
              <td className="px-4 py-2">{r.order_amount}</td>
              <td className="px-4 py-2">{r.transaction_amount}</td>
              <td className="px-4 py-2">{r.status}</td>
              <td className="px-4 py-2">{r.custom_order_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
