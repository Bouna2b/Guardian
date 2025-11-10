'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignupForm } from '../../components/auth/SignupForm';
import { LoginForm } from '../../components/auth/LoginForm';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white">Guardian</h1>
          <p className="text-white/60 mt-2">Protégez votre identité numérique</p>
        </div>

        <div className="glass p-8">
          <div className="flex gap-4 mb-6 border-b border-white/10">
            <button
              onClick={() => setMode('signup')}
              className={`pb-3 px-4 font-medium transition-colors ${
                mode === 'signup'
                  ? 'text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Inscription
            </button>
            <button
              onClick={() => setMode('login')}
              className={`pb-3 px-4 font-medium transition-colors ${
                mode === 'login'
                  ? 'text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Connexion
            </button>
          </div>

          {mode === 'signup' ? (
            <SignupForm onSuccess={() => router.push('/onboarding/kyc')} />
          ) : (
            <LoginForm onSuccess={() => router.push('/dashboard')} />
          )}
        </div>
      </div>
    </div>
  );
}
