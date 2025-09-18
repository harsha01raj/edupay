import React from 'react'
export default function Pagination({ page, limit, total, onPageChange, onLimitChange }){
  const pages = Math.max(1, Math.ceil((total||0)/limit))
  return (
    <div className="flex items-center justify-between mt-4">
      <div>
        <button disabled={page<=1} onClick={()=>onPageChange(page-1)} className="px-3 py-1 border rounded mr-2">Prev</button>
        <button disabled={page>=pages} onClick={()=>onPageChange(page+1)} className="px-3 py-1 border rounded">Next</button>
        <span className="ml-3">Page {page} of {pages}</span>
      </div>
      <div>
        <select value={limit} onChange={e=> onLimitChange(Number(e.target.value)) } className="p-1 border rounded">
          {[10,20,50].map(n=> <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>
    </div>
  )
}
