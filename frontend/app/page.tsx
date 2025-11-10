"use client";
import Link from 'next/link';
import { MotionConfig, motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { PricingSection } from '../components/ui/PricingSection';

export default function Page() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen flex flex-col">
        <Header />
        <section className="flex-1 flex items-center justify-center py-24">
          <div className="max-w-4xl px-6 text-center">
            <motion.h1 className="text-5xl font-semibold" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              Guardian — Protégez votre identité numérique
            </motion.h1>
            <p className="mt-4 text-white/70">Scan, score de réputation, RGPD automatisé, et signature électronique.</p>
            <form className="mt-8 flex gap-2 justify-center" action="/api/subscribe" method="post">
              <input name="email" type="email" placeholder="email@exemple.com" className="px-4 py-3 rounded-lg text-black w-72" required />
              <button className="px-5 py-3 rounded-lg bg-cyan-500 hover:bg-sky-500 text-white">Essayez la bêta</button>
            </form>
            <div className="mt-12 flex gap-4 justify-center">
              <Link href="/auth" className="px-6 py-3 rounded-lg bg-white text-slate-900 hover:bg-white/90 font-medium">
                S'inscrire / Se connecter
              </Link>
              <Link href="/dashboard" className="px-6 py-3 rounded-lg border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 font-medium">
                Voir le dashboard
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
            <div className="glass p-6"><h3 className="text-xl font-medium">Scan</h3><p className="text-white/70 mt-2">Analyse du web pour mention de votre nom.</p></div>
            <div className="glass p-6"><h3 className="text-xl font-medium">Score</h3><p className="text-white/70 mt-2">Guardian Score de 0 à 100.</p></div>
            <div className="glass p-6"><h3 className="text-xl font-medium">RGPD</h3><p className="text-white/70 mt-2">Demandes de suppression automatisées.</p></div>
          </div>
        </section>
        <PricingSection />
        <Footer />
      </main>
    </MotionConfig>
  );
}
