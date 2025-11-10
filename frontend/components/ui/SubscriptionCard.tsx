'use client';
import { getApiBaseUrl } from '@/lib/env';

export function SubscriptionCard() {
  const startCheckout = async (plan: 'free' | 'pro' = 'pro') => {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/subscription/create`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.checkout_url) window.location.href = data.checkout_url;
  };

  return (
    <div className="glass p-6">
      <h2 className="text-lg">Abonnement</h2>
      <p className="text-white/70 mt-2">Plan actuel : Free</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => startCheckout('pro')} className="px-4 py-2 rounded bg-cyan-500">Passer en Premium</button>
        <button onClick={() => startCheckout('free')} className="px-4 py-2 rounded bg-white/10">Rester en Free</button>
      </div>
    </div>
  );
}
