import React from 'react';
import { Cloud, ExternalLink, HardDrive, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatSize } from '../../../utils/fileHelpers';
import { ExternalAccountDto, GoogleDriveStorageDto } from '../../../api/externalAccounts';

interface CloudIntegrationSectionProps {
  accounts: ExternalAccountDto[];
  storageInfo: Record<number, GoogleDriveStorageDto>;
  isLoading: boolean;
  isSyncing: Record<number, boolean>;
  isDisconnecting: Record<number, boolean>;
  isConnecting: boolean;
  handleConnectGoogle: () => void;
  handleDisconnect: (id: number) => void;
  handleSync: (id: number) => void;
}

export default function CloudIntegrationSection({
  accounts,
  storageInfo,
  isLoading,
  isSyncing,
  isDisconnecting,
  isConnecting,
  handleConnectGoogle,
  handleDisconnect,
  handleSync
}: CloudIntegrationSectionProps) {
  const calculatePercent = (used: number, total: number) => {
    if (!total) return 0;
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const googleAccounts = accounts.filter((acc) => acc.provider.toUpperCase().startsWith('GOOGLE'));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cloud Integrations */}
      <Card hoverLift={false} className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Cloud className="text-primary w-6 h-6" />
            <h2 className="text-lg font-bold text-slate-900">Cloud Integrations</h2>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={ExternalLink}
            iconPosition="right"
            isLoading={isConnecting}
            onClick={handleConnectGoogle}
            className="cursor-pointer"
          >
            Hubungkan Google Drive
          </Button>
        </div>

        {isLoading ? (
          <div className="py-8 flex justify-center items-center">
            <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : googleAccounts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-2xl">
            Belum ada akun Google Drive terhubung. Klik tombol di atas untuk menghubungkan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {googleAccounts.map((googleAccount) => (
              <div key={googleAccount.id} className="py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fadeIn">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shrink-0">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{googleAccount.email}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-semibold">
                      Google Drive terhubung. Data disinkronisasikan ke Horizon Drive.
                    </p>
                    
                    {storageInfo[googleAccount.id] && (
                      <div className="mt-3 w-64 max-w-full">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1.5">
                          <span>Pemakaian Google Drive</span>
                          <span>
                            {formatSize(storageInfo[googleAccount.id].usedBytes)} / {formatSize(storageInfo[googleAccount.id].totalBytes)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${calculatePercent(storageInfo[googleAccount.id].usedBytes, storageInfo[googleAccount.id].totalBytes)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-center w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={RefreshCw}
                    isLoading={isSyncing[googleAccount.id]}
                    onClick={() => handleSync(googleAccount.id)}
                    className="flex-1 sm:flex-initial justify-center cursor-pointer"
                  >
                    Sync Files
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    isLoading={isDisconnecting[googleAccount.id]}
                    onClick={() => handleDisconnect(googleAccount.id)}
                    className="flex-1 sm:flex-initial justify-center cursor-pointer"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Security Info */}
      <Card hoverLift={false} className="p-6 md:p-8 border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl shrink-0">
            <ShieldCheck className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sistem Keamanan Horizon</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">
              Horizon Drive mengenkripsi koneksi ke Google Drive Anda secara aman. Token OAuth disimpan terenkripsi di server VPS database dan didekripsi dinamis untuk proses request data saja.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
