import React, { useState, useEffect } from 'react'
import Select from 'react-select'

const STATUS_OPTIONS = [
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

export default function FiltersPanel({ q, status, schoolIds, from, to, onChange }) {
  const [query, setQuery] = useState(q || '')
  useEffect(()=> setQuery(q || ''), [q])

  const handleApply = () => {
    onChange({ q: query || undefined, status: status?.length ? status : undefined, school: schoolIds?.length ? schoolIds : undefined, from: from || undefined, to: to || undefined })
  }

  return (
    <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded shadow">
      <div className="flex gap-2 flex-wrap">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search collect/custom order" className="p-2 border rounded flex-1" />
        <Select isMulti options={STATUS_OPTIONS} value={STATUS_OPTIONS.filter(o=> status?.includes(o.value))} onChange={vals => onChange({ status: vals ? vals.map(v => v.value) : [] })} className="w-60" placeholder="Status"/>
        <input type="date" defaultValue={from} onChange={e=> onChange({ from: e.target.value || undefined })} className="p-2 border rounded"/>
        <input type="date" defaultValue={to} onChange={e=> onChange({ to: e.target.value || undefined })} className="p-2 border rounded"/>
        <button onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white rounded">Apply</button>
      </div>
    </div>
  )
}
