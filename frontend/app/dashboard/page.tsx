'use client';
import { useEffect, useState } from 'react';
import { Search, FileText, ThumbsUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { GuardianScoreGauge } from '../../components/dashboard/GuardianScoreGauge';
import { MentionsList } from '../../components/dashboard/MentionsList';
import { ActionsPanel } from '../../components/dashboard/ActionsPanel';
import { AccountStatusCard } from '../../components/dashboard/AccountStatusCard';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';
import { getApiBaseUrl } from '@/lib/env';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { toasts, removeToast, success, error } = useToast();
  const [dashboardData, setDashboardData] = useState({
    guardianScore: 0,
    mentionsCount: 0,
    deletionsCount: 0,
    positiveMentions: 0,
    negativeMentions: 0,
    neutralMentions: 0,
    alerts: 0,
    mentions: [],
    accountStatus: {
      kyc_status: 'pending' as const,
      mandate_signed: false,
      alerts_enabled: true,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      const res = await fetch(`${base}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      const res = await fetch(`${base}/scan/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.mentionsFound > 0) {
          success(`Scan terminé ! ${result.mentionsFound} mention${result.mentionsFound > 1 ? 's' : ''} trouvée${result.mentionsFound > 1 ? 's' : ''}.`);
        } else {
          success('Scan terminé ! Aucune nouvelle mention trouvée.');
        }
        await fetchDashboardData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        error(errorData.message || 'Erreur lors du scan');
      }
    } catch (err) {
      console.error('Scan failed:', err);
      error('Erreur lors du scan. Vérifiez votre connexion.');
    } finally {
      setScanning(false);
    }
  };

  const handleCreateDeletion = async (mentionId: string) => {
    try {
      const base = getApiBaseUrl();
      const token = localStorage.getItem('guardian_token');
      const res = await fetch(`${base}/deletion/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentionId }),
      });
      
      if (res.ok) {
        success('Demande de suppression créée avec succès');
        await fetchDashboardData();
      } else {
        error('Erreur lors de la création de la demande');
      }
    } catch (err) {
      console.error('Failed to create deletion:', err);
      error('Erreur lors de la création de la demande');
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Mentions trouvées"
          value={dashboardData.mentionsCount}
          icon={Search}
          trend={{ value: 12, label: 'ce mois' }}
          color="cyan"
        />
        <MetricCard
          title="Demandes en cours"
          value={dashboardData.deletionsCount}
          icon={FileText}
          color="amber"
        />
        <MetricCard
          title="Mentions positives"
          value={dashboardData.positiveMentions}
          icon={ThumbsUp}
          trend={{ value: 8, label: 'ce mois' }}
          color="emerald"
        />
        <MetricCard
          title="Alertes"
          value={dashboardData.alerts}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guardian Score Card */}
        <div className="lg:col-span-2 rounded-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Guardian Score</h2>
              <p className="text-sm text-white/60 mt-1">Votre réputation en ligne</p>
            </div>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scan en cours...' : 'Scanner maintenant'}
            </button>
          </div>
          <div className="flex items-center justify-center">
            <GuardianScoreGauge score={dashboardData.guardianScore} size={220} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ActionsPanel onScanClick={handleScan} />
          <AccountStatusCard status={dashboardData.accountStatus} />
        </div>
      </div>

      {/* Mentions List */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Mentions récentes</h2>
        <MentionsList mentions={dashboardData.mentions} onCreateDeletion={handleCreateDeletion} />
      </div>
    </div>
    </>
  );
}
