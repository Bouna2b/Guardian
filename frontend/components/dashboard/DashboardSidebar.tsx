'use client';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Search, FileText, Settings, Shield, LogOut, type LucideIcon } from 'lucide-react';

type NavItem = { href: Route; label: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/mentions', label: 'Mentions', icon: Search },
  { href: '/dashboard/deletions', label: 'Demandes RGPD', icon: FileText },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const { removeAuthToken } = await import('../../lib/auth');
    removeAuthToken();
    router.push('/auth');
  };

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-500" />
          <span className="text-xl font-semibold text-white">Guardian</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-500'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
        <div className="text-xs text-white/40 px-4">
          © 2025 Guardian
        </div>
      </div>
    </aside>
  );
}
