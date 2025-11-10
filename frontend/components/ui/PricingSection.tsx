import Link from 'next/link';

export function PricingSection() {
  return (
    <section className="py-16 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-8">Tarifs</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-6">
            <h3 className="text-xl">Free</h3>
            <p className="text-white/70 mt-2">Scans mensuels limités</p>
            <Link href="/dashboard/settings" className="inline-block mt-6 px-4 py-2 rounded-lg bg-white/10">Choisir</Link>
          </div>
          <div className="glass p-6 border-cyan-500 border">
            <h3 className="text-xl">Premium</h3>
            <p className="text-white/70 mt-2">Scans illimités, priorités RGPD</p>
            <Link href="/dashboard/settings" className="inline-block mt-6 px-4 py-2 rounded-lg bg-cyan-500">Passer Premium</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
