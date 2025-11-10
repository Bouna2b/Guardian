'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return (
    <button
      aria-label="Toggle theme"
      className="p-2 rounded-lg hover:bg-white/10"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
