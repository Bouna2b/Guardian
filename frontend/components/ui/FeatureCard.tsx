import { ReactNode } from 'react';

export function FeatureCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass p-6">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-white/70 mt-2">{children}</p>
    </div>
  );
}
