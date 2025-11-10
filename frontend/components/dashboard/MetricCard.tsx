import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'cyan' | 'emerald' | 'amber' | 'red';
}

const colorClasses = {
  cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  red: 'from-red-500/20 to-red-600/5 border-red-500/20',
};

const iconColorClasses = {
  cyan: 'text-cyan-500',
  emerald: 'text-emerald-500',
  amber: 'text-amber-500',
  red: 'text-red-500',
};

export function MetricCard({ title, value, icon: Icon, trend, color = 'cyan' }: MetricCardProps) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm p-6 hover:scale-[1.02] transition-transform`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white/5 ${iconColorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/60">{title}</div>
    </div>
  );
}
