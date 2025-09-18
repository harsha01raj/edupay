// src/components/DarkToggle.jsx
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'edupay-dark';

export default function DarkToggle() {
  // initial state uses current document class (works & avoids mismatch)
  const [dark, setDark] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s === '1') return true;
      if (s === '0') return false;
      // fallback: check current document
      return document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });

  // keep DOM + localStorage in sync
  useEffect(() => {
    try {
      if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(STORAGE_KEY, '1');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(STORAGE_KEY, '0');
      }
    } catch (e) {
      // ignore storage errors
      console.warn('Dark toggle storage error', e);
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      aria-pressed={dark}
      className="px-3 py-1 rounded border hover:bg-slate-100 dark:hover:bg-slate-700"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
