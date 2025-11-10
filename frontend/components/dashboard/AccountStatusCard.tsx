import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface AccountStatus {
  kyc_status: 'verified' | 'pending' | 'rejected';
  mandate_signed: boolean;
  alerts_enabled: boolean;
}

interface AccountStatusCardProps {
  status: AccountStatus;
}

const kycStatusConfig = {
  verified: { icon: CheckCircle, label: 'Vérifié', color: 'text-emerald-400' },
  pending: { icon: Clock, label: 'En attente', color: 'text-amber-400' },
  rejected: { icon: XCircle, label: 'Rejeté', color: 'text-red-400' },
};

export function AccountStatusCard({ status }: AccountStatusCardProps) {
  const KycIcon = kycStatusConfig[status.kyc_status].icon;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Statut du compte</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">KYC</span>
          <div className={`flex items-center gap-2 ${kycStatusConfig[status.kyc_status].color}`}>
            <KycIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{kycStatusConfig[status.kyc_status].label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Mandat</span>
          <div className={`flex items-center gap-2 ${status.mandate_signed ? 'text-emerald-400' : 'text-amber-400'}`}>
            {status.mandate_signed ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Signé</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Non signé</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Alertes</span>
          <div className={`flex items-center gap-2 ${status.alerts_enabled ? 'text-emerald-400' : 'text-white/40'}`}>
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{status.alerts_enabled ? 'Activées' : 'Désactivées'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
