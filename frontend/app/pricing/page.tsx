export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Pricing</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="text-xl">Free</h3>
          <p className="text-white/70 mt-2">Scans mensuels limités</p>
        </div>
        <div className="glass p-6 border-cyan-500 border">
          <h3 className="text-xl">Premium</h3>
          <p className="text-white/70 mt-2">Scans illimités, priorités RGPD</p>
        </div>
      </div>
    </div>
  );
}
