'use client';
import { useState } from 'react';
import { apiFetch } from '../../lib/apiClient';

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    country: 'FR',
    pseudos: { twitter: '', linkedin: '', github: '', instagram: '' },
    keywords: '',
    gdpr_consent: false,
    newsletter_consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.gdpr_consent) {
      setError('Vous devez accepter les conditions RGPD');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          pseudos: Object.entries(formData.pseudos)
            .filter(([_, v]) => v)
            .map(([k, v]) => ({ platform: k, handle: v })),
          keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        }),
      });
      
      // Store access token if provided
      if (data.access_token) {
        const { setAuthToken } = await import('../../lib/auth');
        setAuthToken(data.access_token);
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-white/60 mb-4">
        Étape 1/2 : Informations personnelles
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/80 mb-1">Prénom *</label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1">Nom *</label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => updateField('last_name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/80 mb-1">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-white/80 mb-1">Mot de passe *</label>
        <input
          type="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
        />
        <p className="text-xs text-white/40 mt-1">Minimum 6 caractères</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/80 mb-1">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1">Date de naissance *</label>
          <input
            type="date"
            required
            value={formData.dob}
            onChange={(e) => updateField('dob', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/80 mb-1">Pays *</label>
        <select
          required
          value={formData.country}
          onChange={(e) => updateField('country', e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
        >
          <option value="FR">France</option>
          <option value="BE">Belgique</option>
          <option value="CH">Suisse</option>
          <option value="CA">Canada</option>
          <option value="US">États-Unis</option>
        </select>
      </div>

      <div className="border-t border-white/10 pt-4">
        <label className="block text-sm text-white/80 mb-2">Pseudos / Réseaux sociaux</label>
        <div className="space-y-2">
          {(['twitter', 'linkedin', 'github', 'instagram'] as const).map((platform) => (
            <input
              key={platform}
              type="text"
              placeholder={`@${platform}`}
              value={formData.pseudos[platform]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pseudos: { ...prev.pseudos, [platform]: e.target.value },
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none text-sm"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/80 mb-1">Mots-clés / Domaines</label>
        <input
          type="text"
          placeholder="marketing, tech, finance..."
          value={formData.keywords}
          onChange={(e) => updateField('keywords', e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
        />
        <p className="text-xs text-white/40 mt-1">Séparez par des virgules</p>
      </div>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.gdpr_consent}
            onChange={(e) => updateField('gdpr_consent', e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-white/80">
            J'accepte la collecte et le traitement de mes données personnelles conformément au RGPD *
          </span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.newsletter_consent}
            onChange={(e) => updateField('newsletter_consent', e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-white/80">
            Je souhaite recevoir la newsletter Guardian
          </span>
        </label>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Inscription...' : 'Continuer vers KYC'}
      </button>
    </form>
  );
}
