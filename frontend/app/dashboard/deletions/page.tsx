'use client';

import { useEffect, useState } from 'react';
import { FileText, Send, CheckCircle2, Clock, Download, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';
import { formatDate } from '@/lib/formatters';
import { getApiBaseUrl } from '@/lib/env';

interface Deletion {
  id: string;
  site: string;
  platform: string;
  status: 'pending' | 'sent' | 'resolved';
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  pending: number;
  sent: number;
  resolved: number;
}

export default function DeletionsPage() {
  const [deletions, setDeletions] = useState<Deletion[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, sent: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ site: '', platform: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');

      const [deletionsRes, statsRes] = await Promise.all([
        fetch(`${base}/deletion/list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${base}/deletion/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (deletionsRes.ok) {
        const data = await deletionsRes.json();
        setDeletions(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.site || !formData.platform) {
      error('Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');

      const res = await fetch(`${base}/deletion/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        success('Demande créée avec succès');
        setShowModal(false);
        setFormData({ site: '', platform: '' });
        await fetchData();
      } else {
        error('Erreur lors de la création de la demande');
      }
    } catch (err) {
      console.error('Failed to create demand:', err);
      error('Erreur lors de la création de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');

      const res = await fetch(`${base}/deletion/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'demandes-rgpd.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        success('Export réussi');
      } else {
        error('Erreur lors de l\'export');
      }
    } catch (err) {
      console.error('Failed to export:', err);
      error('Erreur lors de l\'export');
    }
  };

  const statusConfig = {
    pending: {
      label: 'En attente',
      icon: Clock,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    sent: {
      label: 'Envoyées',
      icon: Send,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    resolved: {
      label: 'Résolues',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  };

  // formatDate est maintenant importé de @/lib/formatters

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Demandes RGPD</h1>
            <p className="text-white/60 text-sm mt-1">
              Gérez vos demandes de suppression et rectification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter en CSV
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle demande
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">En attente</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Envoyées</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.sent}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Send className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Résolues</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.resolved}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Deletions List */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Historique des demandes</h2>

          {loading ? (
            <div className="text-center py-12 text-white/60">Chargement...</div>
          ) : deletions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucune demande créée</h3>
              <p className="text-white/60 text-sm mb-4">
                Créez votre première demande de suppression RGPD
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer votre première demande
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {deletions.map((deletion) => {
                const StatusIcon = statusConfig[deletion.status].icon;
                return (
                  <div
                    key={deletion.id}
                    className="rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{deletion.site}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">
                            {deletion.platform}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span>Créée le {formatDate(deletion.created_at)}</span>
                          <span>•</span>
                          <span>Mise à jour le {formatDate(deletion.updated_at)}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig[deletion.status].color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{statusConfig[deletion.status].label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Nouvelle demande RGPD</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nom du site *
                </label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder="Ex: Facebook, Google, etc."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Plateforme *
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none"
                  required
                >
                  <option value="">Sélectionnez une plateforme</option>
                  <option value="Réseau social">Réseau social</option>
                  <option value="Moteur de recherche">Moteur de recherche</option>
                  <option value="Site web">Site web</option>
                  <option value="Forum">Forum</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Création...' : 'Créer la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
