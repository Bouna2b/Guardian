import { getApiBaseUrl } from '@/lib/env';

async function fetchJSON(path: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminPage() {
  const [users, deletions] = await Promise.all([
    fetchJSON('/admin/users'),
    fetchJSON('/admin/deletions'),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="glass p-6">
        <h2 className="text-lg mb-2">Utilisateurs</h2>
        <pre className="text-xs whitespace-pre-wrap text-white/80">{JSON.stringify(users, null, 2)}</pre>
      </div>
      <div className="glass p-6">
        <h2 className="text-lg mb-2">Suppressions RGPD</h2>
        <pre className="text-xs whitespace-pre-wrap text-white/80">{JSON.stringify(deletions, null, 2)}</pre>
      </div>
    </div>
  );
}
