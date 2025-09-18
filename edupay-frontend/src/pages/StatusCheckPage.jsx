import React from 'react'
import StatusCheck from '../components/StatusCheck'

export default function StatusCheckPage(){
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 p-4 dark:bg-gray-700">Check Transaction Status</h2>
      <StatusCheck />
    </div>
  )
}
