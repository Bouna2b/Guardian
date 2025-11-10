import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 hidden md:block sticky top-14 h-[calc(100vh-56px)] border-r border-white/10 p-4">
      <nav className="space-y-2 text-sm">
        <Link href="/dashboard" className="block hover:underline">Dashboard</Link>
        <Link href="/dashboard/settings" className="block hover:underline">Settings</Link>
        <Link href="/admin" className="block hover:underline">Admin</Link>
      </nav>
    </aside>
  );
}
