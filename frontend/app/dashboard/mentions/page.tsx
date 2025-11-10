'use client';
import { useEffect, useState } from 'react';
import { ExternalLink, Search, Filter, Trash2, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';
import { formatRelativeDate } from '@/lib/formatters';
import { getApiBaseUrl } from '@/lib/env';

interface Mention {
  id: string;
  source: string;
  title: string;
  content: string;
  url: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  date: string;
}

export default function MentionsPage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [showDomainFilter, setShowDomainFilter] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchMentions();
  }, []);

  const fetchMentions = async () => {
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      const res = await fetch(`${base}/scan/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMentions(data);
      } else {
        error('Erreur lors du chargement des mentions');
      }
    } catch (err) {
      console.error('Failed to fetch mentions:', err);
      error('Impossible de charger les mentions');
    } finally {
      setLoading(false);
    }
  };

  // Extraire le domaine d'une URL
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Autre';
    }
  };

  // Obtenir tous les domaines uniques
  const allDomains = Array.from(new Set(mentions.map(m => extractDomain(m.url))));

  const filteredMentions = mentions.filter((m) => {
    // Filtre par sentiment
    if (filter !== 'all' && m.sentiment !== filter) return false;
    
    // Filtre par domaine
    if (selectedDomains.size > 0) {
      const domain = extractDomain(m.url);
      if (!selectedDomains.has(domain)) return false;
    }
    
    return true;
  });

  // Compter les mentions par domaine
  const domainCounts = mentions.reduce((acc, m) => {
    const domain = extractDomain(m.url);
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMentions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMentions.map((m) => m.id)));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Supprimer ${selectedIds.size} mention(s) ? Ces URLs seront blacklistées et ne réapparaîtront plus dans les futurs scans.`)) return;

    setDeleting(true);
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      
      // Récupérer les URLs des mentions sélectionnées pour la blacklist
      const urlsToBlacklist = mentions
        .filter(m => selectedIds.has(m.id))
        .map(m => m.url);
      
      const res = await fetch(`${base}/scan/delete-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          ids: Array.from(selectedIds),
          blacklistUrls: urlsToBlacklist
        }),
      });

      if (res.ok) {
        success(`${selectedIds.size} mention(s) supprimée(s) et blacklistée(s)`);
        setSelectedIds(new Set());
        await fetchMentions();
      } else {
        error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Failed to delete mentions:', err);
      error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const toggleDomain = (domain: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domain)) {
      newSelected.delete(domain);
    } else {
      newSelected.add(domain);
    }
    setSelectedDomains(newSelected);
  };

  const clearDomainFilter = () => {
    setSelectedDomains(new Set());
  };

  const deleteAll = async () => {
    if (!confirm('Supprimer TOUTES les mentions ? Cette action est irréversible.')) return;

    setDeleting(true);
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      
      const res = await fetch(`${base}/scan/all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        success('Toutes les mentions ont été supprimées');
        setSelectedIds(new Set());
        await fetchMentions();
      } else {
        error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Failed to delete all mentions:', err);
      error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const sentimentColors = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-white/5 text-white/60 border-white/10',
    negative: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const sentimentLabels = {
    positive: 'Positif',
    neutral: 'Neutre',
    negative: 'Négatif',
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Mentions trouvées</h1>
          <p className="text-white/60 text-sm mt-1">
            {filteredMentions.length} mention{filteredMentions.length > 1 ? 's' : ''} trouvée{filteredMentions.length > 1 ? 's' : ''}
            {selectedDomains.size > 0 && ` · ${selectedDomains.size} domaine(s) filtré(s)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDomainFilter(!showDomainFilter)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
              showDomainFilter || selectedDomains.size > 0
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtrer par domaine
            {selectedDomains.size > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-white text-xs">
                {selectedDomains.size}
              </span>
            )}
          </button>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">Tous les sentiments</option>
            <option value="positive">Positives</option>
            <option value="neutral">Neutres</option>
            <option value="negative">Négatives</option>
          </select>
        </div>
      </div>

      {/* Filtre par domaine */}
      {showDomainFilter && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filtrer par domaine</h3>
            {selectedDomains.size > 0 && (
              <button
                onClick={clearDomainFilter}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                Effacer les filtres
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allDomains.sort().map((domain) => (
              <label
                key={domain}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedDomains.has(domain)}
                  onChange={() => toggleDomain(domain)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{domain}</div>
                  <div className="text-xs text-white/60">
                    {domainCounts[domain]} mention{domainCounts[domain] > 1 ? 's' : ''}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-white/60">Chargement...</div>
      ) : filteredMentions.length === 0 ? (
        <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center">
          <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucune mention trouvée</h3>
          <p className="text-white/60 text-sm">
            Lancez un scan depuis le dashboard pour trouver des mentions vous concernant.
          </p>
        </div>
      ) : (
        <>
          {/* Actions bar */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                {selectedIds.size === filteredMentions.length ? (
                  <CheckSquare className="w-5 h-5 text-cyan-500" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                Tout sélectionner
              </button>
              {selectedIds.size > 0 && (
                <span className="text-sm text-white/60">
                  {selectedIds.size} sélectionnée(s)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <button
                  onClick={deleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer la sélection
                </button>
              )}
              <button
                onClick={deleteAll}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Tout supprimer
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredMentions.map((mention) => (
              <div
                key={mention.id}
                className="rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-start gap-4 mb-4">
                  <button
                    onClick={() => toggleSelection(mention.id)}
                    className="mt-1"
                  >
                    {selectedIds.has(mention.id) ? (
                      <CheckSquare className="w-5 h-5 text-cyan-500" />
                    ) : (
                      <Square className="w-5 h-5 text-white/40 hover:text-white/60" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-white/60">{mention.source}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${sentimentColors[mention.sentiment]}`}
                      >
                        {sentimentLabels[mention.sentiment]}
                      </span>
                      <span className="text-xs text-white/40">{formatRelativeDate(mention.date)}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{mention.title}</h3>
                    
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">{mention.content}</p>

                    {mention.url && (
                      <a
                        href={mention.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Voir la source
                        <span className="text-xs text-cyan-400/60 ml-2 truncate max-w-md">
                          {mention.url}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    </>
  );
}
