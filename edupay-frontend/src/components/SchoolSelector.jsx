import React from 'react'

export default function SchoolSelector({ value, onChange }) {
  return (
    <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder="Enter school ID" className="p-2 border rounded" />
  )
}
