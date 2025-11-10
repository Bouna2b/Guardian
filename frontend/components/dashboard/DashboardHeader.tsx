'use client';
import { Bell, Moon, Sun, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatFullName } from '@/lib/formatters';
import { getApiBaseUrl } from '@/lib/env';

export function DashboardHeader() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [userName, setUserName] = useState('Utilisateur');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('guardian_theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const base = getApiBaseUrl();
        const token = localStorage.getItem('guardian_token');
        const res = await fetch(`${base}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const formattedName = formatFullName(data.first_name || '', data.last_name || '');
          setUserName(formattedName || 'Utilisateur');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (selectedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
      root.classList.toggle('light', !prefersDark);
    } else if (selectedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('guardian_theme', newTheme);
    applyTheme(newTheme);
    setShowThemeMenu(false);
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#0f172a]/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Tableau de bord</h1>
        <p className="text-sm text-white/60">Bienvenue, {userName}</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
        </button>
        
        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            {theme === 'light' && <Sun className="w-5 h-5" />}
            {theme === 'dark' && <Moon className="w-5 h-5" />}
            {theme === 'system' && <Monitor className="w-5 h-5" />}
          </button>
          
          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#1e293b] border border-white/10 shadow-xl z-50">
              <div className="p-2">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors ${
                    theme === 'light' ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/80'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">Clair</span>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors ${
                    theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/80'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">Sombre</span>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors ${
                    theme === 'system' ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/80'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm">Système</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
