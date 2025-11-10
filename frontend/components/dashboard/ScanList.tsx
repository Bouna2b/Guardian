type Item = { site: string; sentiment: 'positive' | 'neutral' | 'negative' };

export function ScanList({ items }: { items: Item[] }) {
  return (
    <div className="glass p-6">
      <h3 className="text-lg mb-4">Derniers scans</h3>
      <ul className="space-y-2">
        {items.map((i, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <span className="text-white/80">{i.site}</span>
            <span className={
              i.sentiment === 'positive' ? 'text-emerald-400' : i.sentiment === 'neutral' ? 'text-white/60' : 'text-amber-400'
            }>
              {i.sentiment}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
