import { Scan, FileText, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';

interface ActionsPanelProps {
  onScanClick?: () => void;
}

export function ActionsPanel({ onScanClick }: ActionsPanelProps) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
      <div className="space-y-3">
        <button
          onClick={onScanClick}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
        >
          <Scan className="w-5 h-5" />
          <span className="font-medium">Lancer un scan</span>
        </button>

        <Link
          href="/dashboard/deletions"
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">Nouvelle demande RGPD</span>
        </Link>

        <Link href="/dashboard/settings" className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <SettingsIcon className="w-5 h-5" />
          <span className="font-medium">Paramètres</span>
        </Link>
      </div>
    </div>
  );
}
