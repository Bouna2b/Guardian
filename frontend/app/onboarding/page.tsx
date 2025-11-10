'use client';
import { UploadID } from '../../components/onboarding/UploadID';
import { SignatureModal } from '../../components/onboarding/SignatureModal';
import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-3xl font-semibold">Onboarding</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-2">1. Upload pièce d'identité</h2>
          <UploadID onUploaded={() => {}} />
        </div>
        <div>
          <h2 className="text-xl mb-2">2. Signature électronique</h2>
          <SignatureModal onSigned={() => {}} />
        </div>
        <div className="glass p-6">
          <h2 className="text-xl mb-2">3. Confirmation</h2>
          <p className="text-white/70">Bienvenue sur Guardian !</p>
          <Link href="/dashboard" className="inline-block mt-4 px-4 py-2 rounded-lg bg-cyan-500">Aller au dashboard</Link>
        </div>
      </div>
    </div>
  );
}
