// src/components/UserMenu.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <div className="text-sm">
            <div className="font-medium">{user.name || user.email}</div>
            <div className="text-xs text-gray-500">{user.role || ''}</div>
          </div>
          <button onClick={logout} className="px-3 py-1 text-sm border rounded">Logout</button>
        </>
      ) : (
        <div className="text-sm text-gray-600">Not signed in</div>
      )}
    </div>
  );
}
