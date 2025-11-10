'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KYCUploader } from '../../../components/kyc/KYCUploader';
import { Shield, Lock, Clock } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/env';

export default function KYCPage() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'upload' | 'processing'>('info');
  const [uploads, setUploads] = useState<{ id_front?: string; id_back?: string; selfie?: string }>({});

  const handleUploadComplete = (type: 'id_front' | 'id_back' | 'selfie', url: string) => {
    setUploads((prev) => ({ ...prev, [type]: url }));
  };

  const handleSubmit = async () => {
    setStep('processing');
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      
      await fetch(`${base}/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileRefs: uploads }),
      });

      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setStep('upload');
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Vérification en cours...</h2>
          <p className="text-white/60 mt-2">Nous analysons vos documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white">Vérification d'identité (KYC)</h1>
          <p className="text-white/60 mt-2">Étape 2/2 : Sécurisez votre compte</p>
        </div>

        {step === 'info' && (
          <div className="glass p-8 space-y-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-white mb-2">Pourquoi cette vérification ?</h3>
                <p className="text-white/70 text-sm">
                  Pour protéger votre identité et lancer des demandes RGPD en votre nom, nous devons vérifier que vous êtes bien la personne que vous prétendez être.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-white mb-2">Sécurité et confidentialité</h3>
                <p className="text-white/70 text-sm">
                  Vos documents sont chiffrés de bout en bout et stockés de manière sécurisée. Nous ne les partageons jamais avec des tiers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-white mb-2">Conservation des données</h3>
                <p className="text-white/70 text-sm">
                  Nous conservons vos documents pendant 90 jours maximum. Vous pouvez demander leur suppression immédiate depuis vos paramètres.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <button
                onClick={() => setStep('upload')}
                className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors"
              >
                Continuer vers l'upload
              </button>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="glass p-6">
              <h3 className="font-medium text-white mb-4">1. Pièce d'identité (recto)</h3>
              <KYCUploader
                type="id_front"
                label="CNI, Passeport ou Permis de conduire"
                onUploadComplete={(url) => handleUploadComplete('id_front', url)}
              />
            </div>

            <div className="glass p-6">
              <h3 className="font-medium text-white mb-4">2. Pièce d'identité (verso) - Optionnel</h3>
              <KYCUploader
                type="id_back"
                label="Verso de votre CNI si applicable"
                onUploadComplete={(url) => handleUploadComplete('id_back', url)}
              />
            </div>

            <div className="glass p-6">
              <h3 className="font-medium text-white mb-4">3. Selfie</h3>
              <KYCUploader
                type="selfie"
                label="Photo claire de votre visage"
                onUploadComplete={(url) => handleUploadComplete('selfie', url)}
              />
            </div>

            <div className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">
                    Documents uploadés : {Object.keys(uploads).length} / 3
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Au minimum : pièce d'identité (recto) + selfie
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!uploads.id_front || !uploads.selfie}
                  className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Envoyer pour vérification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
