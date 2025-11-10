import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-900/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Guardian</Link>
        <nav className="flex items-center gap-6 text-sm text-white/80">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard/settings">Settings</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
