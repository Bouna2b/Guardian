'use client';
import { useState, useEffect } from 'react';
import { User, Link as LinkIcon, Bell, Shield, FileText, Moon, Sun, Monitor, X, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';
import { getApiBaseUrl } from '@/lib/env';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dob: '',
    city: '',
    country: '',
    profession: '',
    phone: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    twitter: '',
  });
  
  const [pseudos, setPseudos] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newPseudo, setNewPseudo] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertFrequency, setAlertFrequency] = useState('Immédiat');
  const [theme, setTheme] = useState<'Clair' | 'Sombre' | 'Système'>('Sombre');
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [mandateStatus, setMandateStatus] = useState<any>(null);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchKycStatus();
    fetchMandateStatus();
    loadTheme();
  }, []);

  const fetchProfile = async () => {
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      const res = await fetch(`${base}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        
        // Set profile data from user metadata
        setProfile({
          first_name: data.first_name || data.user_metadata?.first_name || '',
          last_name: data.last_name || data.user_metadata?.last_name || '',
          email: data.email || '',
          dob: data.user_metadata?.dob || '',
          city: data.user_metadata?.city || '',
          country: data.user_metadata?.country || '',
          profession: data.user_metadata?.profession || '',
          phone: data.phone || data.user_metadata?.phone || '',
          linkedin: data.user_metadata?.linkedin || '',
          facebook: data.user_metadata?.facebook || '',
          instagram: data.user_metadata?.instagram || '',
          twitter: data.user_metadata?.twitter || '',
        });
        
        // Set pseudos from user metadata
        if (data.user_metadata?.pseudos && Array.isArray(data.user_metadata.pseudos)) {
          const pseudoList = data.user_metadata.pseudos.map((p: any) => 
            typeof p === 'string' ? p : p.handle || p.platform
          ).filter(Boolean);
          setPseudos(pseudoList);
        }
        
        // Set keywords from user metadata
        if (data.user_metadata?.keywords && Array.isArray(data.user_metadata.keywords)) {
          setKeywords(data.user_metadata.keywords);
        }
        
        // Set exclusions from user metadata (if exists)
        if (data.user_metadata?.exclusions && Array.isArray(data.user_metadata.exclusions)) {
          setExclusions(data.user_metadata.exclusions);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      const res = await fetch(`${base}/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKycStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch KYC status:', err);
    }
  };

  const fetchMandateStatus = async () => {
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      const res = await fetch(`${base}/mandate/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMandateStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch mandate status:', err);
    }
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('guardian_theme') as 'Clair' | 'Sombre' | 'Système' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  };

  const applyTheme = (selectedTheme: 'Clair' | 'Sombre' | 'Système') => {
    const root = document.documentElement;
    
    if (selectedTheme === 'Système') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
      root.classList.toggle('light', !prefersDark);
    } else if (selectedTheme === 'Sombre') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: 'Clair' | 'Sombre' | 'Système') => {
    setTheme(newTheme);
    localStorage.setItem('guardian_theme', newTheme);
    applyTheme(newTheme);
    success(`Thème changé : ${newTheme}`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      
      const res = await fetch(`${base}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          dob: profile.dob,
          city: profile.city,
          country: profile.country,
          profession: profile.profession,
          linkedin: profile.linkedin,
          facebook: profile.facebook,
          instagram: profile.instagram,
          twitter: profile.twitter,
          pseudos,
          keywords,
          exclusions,
        }),
      });
      
      if (res.ok) {
        success('Modifications enregistrées avec succès !');
      } else {
        const errorData = await res.json();
        error(`Erreur: ${errorData.message || 'Impossible de sauvegarder'}`);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const addPseudo = () => {
    if (newPseudo.trim()) {
      setPseudos([...pseudos, newPseudo.trim()]);
      setNewPseudo('');
    }
  };

  const removePseudo = (index: number) => {
    setPseudos(pseudos.filter((_, i) => i !== index));
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setExclusions([...exclusions, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const getKycStatusBadge = () => {
    if (!kycStatus) return null;
    
    const config = {
      not_started: { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: 'Non démarré' },
      pending: { icon: Clock, color: 'text-orange-400 bg-orange-500/10', label: 'En cours' },
      verified: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10', label: 'Vérifié' },
    };
    
    const status = config[kycStatus.status as keyof typeof config] || config.not_started;
    const Icon = status.icon;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{status.label}</span>
      </div>
    );
  };

  const getMandateStatusBadge = () => {
    if (!mandateStatus) return null;
    
    const config = {
      not_created: { icon: AlertCircle, color: 'text-gray-400 bg-gray-500/10', label: 'Non créé' },
      pending: { icon: Clock, color: 'text-orange-400 bg-orange-500/10', label: 'En attente' },
      signed: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10', label: 'Signé' },
    };
    
    const status = config[mandateStatus.status as keyof typeof config] || config.not_created;
    const Icon = status.icon;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{status.label}</span>
      </div>
    );
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Paramètres</h1>
        <p className="text-white/60 text-sm mt-1">Gérez votre profil et vos préférences</p>
      </div>

      {/* Informations personnelles */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Informations personnelles</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Prénom *</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Nom *</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Date de naissance</label>
              <input
                type="text"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Téléphone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Ville</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Pays</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Profession / Secteur</label>
            <input
              type="text"
              value={profile.profession}
              onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Profils Sociaux */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-2">
          <LinkIcon className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Profils Sociaux</h2>
        </div>
        <p className="text-sm text-white/60 mb-4">Ajoutez les URLs de vos profils pour affiner la recherche et éliminer les homonymes.</p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#0077b5] flex items-center justify-center text-white text-xs font-bold">in</div>
            <input
              type="url"
              placeholder="URL de votre profil LinkedIn"
              value={profile.linkedin}
              onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#1877f2] flex items-center justify-center text-white text-xs font-bold">f</div>
            <input
              type="url"
              placeholder="URL de votre profil Facebook"
              value={profile.facebook}
              onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xs font-bold">📷</div>
            <input
              type="url"
              placeholder="URL de votre profil Instagram"
              value={profile.instagram}
              onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Alias et Exclusions */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Alias et Exclusions</h2>
        
        {/* Pseudonymes */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-2">Pseudonymes à surveiller</h3>
          <p className="text-xs text-white/60 mb-3">Ajoutez des pseudonymes, noms d'utilisateur ou alias que vous utilisez en ligne.</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {pseudos.map((pseudo, index) => (
              <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
                <span>{pseudo}</span>
                <button onClick={() => removePseudo(index)} className="hover:text-cyan-300">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ajouter un pseudonyme"
              value={newPseudo}
              onChange={(e) => setNewPseudo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPseudo()}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none text-sm"
            />
            <button
              onClick={addPseudo}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exclusions */}
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Mots-clés d'exclusion</h3>
          <p className="text-xs text-white/60 mb-3">Ajoutez des termes (professions, villes...) liés à vos homonymes pour les exclure des résultats.</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {exclusions.map((exclusion, index) => (
              <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                <span>{exclusion}</span>
                <button onClick={() => removeExclusion(index)} className="hover:text-amber-300">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ajouter un mot-clé d'exclusion"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExclusion()}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none text-sm"
            />
            <button
              onClick={addExclusion}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mots-clés de surveillance */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Mots-clés de surveillance</h2>
        <p className="text-sm text-white/60 mb-4">Ajoutez des mots-clés pour affiner la recherche de mentions vous concernant.</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.map((keyword, index) => (
            <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <span>{keyword}</span>
              <button onClick={() => removeKeyword(index)} className="hover:text-emerald-300">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un mot-clé"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none text-sm"
          />
          <button
            onClick={addKeyword}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-white">Alertes activées</div>
              <div className="text-xs text-white/60">Recevoir des notifications pour les nouvelles mentions</div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </div>
          </label>

          <div>
            <label className="block text-sm text-white/80 mb-2">Fréquence des alertes</label>
            <select
              value={alertFrequency}
              onChange={(e) => setAlertFrequency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="Immédiat">Immédiat</option>
              <option value="Quotidien">Quotidien</option>
              <option value="Hebdomadaire">Hebdomadaire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Apparence */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Apparence</h2>
        
        <div>
          <label className="block text-sm text-white/80 mb-3">Thème</label>
          <div className="grid grid-cols-3 gap-3">
            {(['Clair', 'Sombre', 'Système'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`p-3 rounded-lg border transition-colors ${
                  theme === t
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {t === 'Clair' && <Sun className="w-5 h-5" />}
                  {t === 'Sombre' && <Moon className="w-5 h-5" />}
                  {t === 'Système' && <Monitor className="w-5 h-5" />}
                  <span className="text-sm text-white">{t}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sécurité et vérification */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Sécurité et vérification</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-sm font-medium text-white">Vérification d'identité (KYC)</div>
                {getKycStatusBadge()}
              </div>
              <div className="text-xs text-white/60 mb-3">Vérifiez votre identité pour activer l'envoi de demandes RGPD.</div>
              {kycStatus?.message && (
                <div className="text-xs text-white/80">{kycStatus.message}</div>
              )}
            </div>
            <a 
              href="/onboarding/kyc" 
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              {kycStatus?.verified ? 'Voir le statut' : 'Commencer'}
            </a>
          </div>

          <div className="flex items-start justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-sm font-medium text-white">Mandat RGPD</div>
                {getMandateStatusBadge()}
              </div>
              <div className="text-xs text-white/60 mb-3">Signez le mandat pour nous autoriser à agir en votre nom.</div>
              {mandateStatus?.message && (
                <div className="text-xs text-white/80">{mandateStatus.message}</div>
              )}
            </div>
            <a 
              href="/mandate" 
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              {mandateStatus?.signed ? 'Consulter' : 'Signer'}
            </a>
          </div>
        </div>
      </div>

      {/* Sécurité et confidentialité */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Sécurité et confidentialité</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Email:</span>
            <span className="text-white">{profile.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Rôle:</span>
            <span className="text-white">Administrateur</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
    </>
  );
}
