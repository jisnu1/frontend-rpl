import React, { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles, X, BookOpen, User } from 'lucide-react';
import { requestSubscriptionUpgrade, fetchMySubscriptionRequest } from '../../api/auth';
import { SubscriptionRequest } from '../../types/auth.types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  onSuccess?: () => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  onSuccess
}: UpgradeModalProps) {
  const [pendingRequest, setPendingRequest] = useState<SubscriptionRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedDetailPlan, setSelectedDetailPlan] = useState<any | null>(null);
  const [confirmTier, setConfirmTier] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPendingRequest();
    }
  }, [isOpen]);

  const loadPendingRequest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const req = await fetchMySubscriptionRequest();
      setPendingRequest(req);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (tier: string) => {
    setConfirmTier(tier);
  };

  const executeUpgrade = async (tier: string) => {
    setActionLoading(tier);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await requestSubscriptionUpgrade(tier);
      setPendingRequest(res);
      setSuccessMsg("Permintaan upgrade berhasil diajukan! Menunggu persetujuan admin.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal mengajukan permintaan upgrade. Silakan coba lagi.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  const plans = [
    {
      id: 'FREEMIUM',
      name: 'Freemium',
      icon: User,
      price: 'Gratis',
      color: 'slate',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      features: [
        { label: 'Penyimpanan 1 GB', isAvailable: true },
        { label: 'Maksimal 1 Akun Cloud', isAvailable: true },
        { label: '5 Permintaan AI per hari', isAvailable: true },
        { label: '3 Migrasi per hari (Maks 256 MB)', isAvailable: true },
        { label: '30 Link Share Publik Aktif', isAvailable: true },
        { label: 'Akun Cloud & Share Tanpa Batas', isAvailable: false },
        { label: 'Migrasi Tanpa Batas (Ukuran GB)', isAvailable: false }
      ],
      details: [
        'Kapasitas Penyimpanan: 1 Gigabyte (GB) untuk menyimpan berkas personal Anda di Horizon Cloud.',
        'Akun Cloud Eksternal: Menghubungkan maksimal 1 akun (Google Drive).',
        'Ringkasan AI: Batas maksimal 5 permintaan ringkasan teks atau PDF setiap harinya.',
        'Migrasi Berkas: Maksimal 3 kali proses migrasi file per hari dengan batas ukuran maksimal 256 Megabyte (MB) per berkas.',
        'Tautan Berbagi Aktif: Maksimal 30 tautan share publik dan 30 email share privat aktif secara bersamaan.'
      ]
    },
    {
      id: 'PREMIUM_INDIVIDUAL',
      name: 'Premium Individual',
      icon: Sparkles,
      price: 'Berbayar (via Admin)',
      color: 'amber',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      features: [
        { label: 'Penyimpanan 15 GB', isAvailable: true },
        { label: 'Maksimal 5 Akun Cloud', isAvailable: true },
        { label: '50 Permintaan AI per hari', isAvailable: true },
        { label: 'Migrasi Berkas Tanpa Batas', isAvailable: true },
        { label: 'Ukuran file migrasi Tanpa Batas', isAvailable: true },
        { label: 'Link Share & Privat Tanpa Batas', isAvailable: true }
      ],
      details: [
        'Kapasitas Penyimpanan: 15 Gigabyte (GB) penyimpanan super lega.',
        'Akun Cloud Eksternal: Menghubungkan hingga 5 akun cloud eksternal sekaligus.',
        'Ringkasan AI: Batas maksimal 50 permintaan ringkasan teks atau PDF per hari.',
        'Migrasi Berkas: Bebas melakukan migrasi berkas tanpa batasan frekuensi harian maupun batasan ukuran berkas.',
        'Tautan Berbagi Aktif: Bebas membuat tautan berbagi publik maupun privat tanpa batasan kuota.'
      ]
    },
    {
      id: 'PREMIUM_ACADEMIC',
      name: 'Premium Academic',
      icon: BookOpen,
      price: 'Khusus Akademik',
      color: 'cyan',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      features: [
        { label: 'Penyimpanan 10 GB', isAvailable: true },
        { label: 'Maksimal 3 Akun Cloud', isAvailable: true },
        { label: '30 Permintaan AI per hari', isAvailable: true },
        { label: '30 Migrasi per hari (Maks 10 GB)', isAvailable: true },
        { label: '100 Link Share Publik Aktif', isAvailable: true },
        { label: '100 Share Privat Aktif', isAvailable: true },
        { label: 'Ukuran file migrasi Tanpa Batas', isAvailable: false }
      ],
      details: [
        'Kapasitas Penyimpanan: 10 Gigabyte (GB) penyimpanan untuk kebutuhan akademik.',
        'Akun Cloud Eksternal: Menghubungkan hingga 3 akun cloud eksternal sekaligus.',
        'Ringkasan AI: Batas maksimal 30 permintaan ringkasan teks atau PDF per hari.',
        'Migrasi Berkas: Maksimal 30 kali proses migrasi file per hari dengan batas ukuran maksimal 10 Gigabyte (GB) per berkas.',
        'Tautan Berbagi Aktif: Maksimal 100 tautan share publik dan 100 share privat aktif secara bersamaan.'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Upgrade Kapasitas Penyimpanan</h2>
          <p className="text-sm text-slate-500 font-bold mt-1.5">
            Pilih paket langganan terbaik. Klik kartu paket untuk melihat detail deskripsi lengkap.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh] space-y-6">
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold px-4 py-3 rounded-2xl">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold px-4 py-3 rounded-2xl">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = currentTier === plan.id;
                const isPendingThis = pendingRequest?.requestedTier === plan.id && pendingRequest?.status === 'PENDING';
                const hasAnyPending = pendingRequest?.status === 'PENDING';

                let buttonText = 'Pilih Paket';
                let buttonStyle = 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/10';
                let isDisabled = false;

                if (isCurrent) {
                  buttonText = 'Paket Anda Saat Ini';
                  buttonStyle = 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed';
                  isDisabled = true;
                } else if (isPendingThis) {
                  buttonText = 'Menunggu Persetujuan';
                  buttonStyle = 'bg-amber-100 text-amber-800 border border-amber-200 cursor-not-allowed';
                  isDisabled = true;
                } else if (hasAnyPending) {
                  buttonText = 'Pilih Paket';
                  buttonStyle = 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed';
                  isDisabled = true;
                } else if (plan.id === 'FREEMIUM') {
                  buttonText = 'Bawaan';
                  buttonStyle = 'bg-slate-100 text-slate-400 cursor-not-allowed';
                  isDisabled = true;
                }

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedDetailPlan(plan)}
                    className={`border rounded-3xl p-6 flex flex-col justify-between transition-all relative cursor-pointer hover:shadow-xl hover:-translate-y-0.5 ${
                      isCurrent 
                        ? 'border-primary shadow-lg ring-1 ring-primary/20 bg-primary/5' 
                        : isPendingThis
                        ? 'border-amber-400 bg-amber-50/30'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-black bg-primary text-white uppercase tracking-wider shadow-sm">
                        Aktif
                      </span>
                    )}

                    <div className="space-y-5">
                      {/* Plan Header */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                          plan.color === 'amber'
                            ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
                            : plan.color === 'cyan'
                            ? 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-800 leading-none">{plan.name}</h4>
                          <p className="text-xs font-bold text-slate-500 mt-1">{plan.price}</p>
                        </div>
                      </div>

                      {/* Plan Features */}
                      <ul className="space-y-3 pt-2">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className={`flex items-start gap-2.5 text-xs font-bold leading-relaxed ${
                            feat.isAvailable ? 'text-slate-700' : 'text-slate-400 line-through'
                          }`}>
                            {feat.isAvailable ? (
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            )}
                            <span>{feat.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Plan Button */}
                    <div className="pt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpgradeClick(plan.id);
                        }}
                        disabled={isDisabled || actionLoading !== null}
                        className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${buttonStyle}`}
                      >
                        {actionLoading === plan.id && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        <span>{buttonText}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Plan Sub-Modal */}
      {selectedDetailPlan && (
        <div className="fixed inset-0 bg-slate-950/75 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedDetailPlan(null)}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden relative p-6 sm:p-8 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedDetailPlan(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-5">
              <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center border ${
                selectedDetailPlan.color === 'amber'
                  ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
                  : selectedDetailPlan.color === 'cyan'
                  ? 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-sm'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {React.createElement(selectedDetailPlan.icon, { className: "w-7 h-7" })}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Detail Paket {selectedDetailPlan.name}</h3>
                <p className="text-sm text-slate-500 font-bold mt-1">{selectedDetailPlan.price}</p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 space-y-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Deskripsi Lengkap Fitur:</p>
                <ul className="space-y-3">
                  {selectedDetailPlan.details.map((detail: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-bold text-slate-650 leading-relaxed">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => setSelectedDetailPlan(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-sm transition-all cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmTier && (
        <div className="fixed inset-0 bg-slate-950/80 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn" onClick={() => setConfirmTier(null)}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative p-6 sm:p-8 animate-scaleIn text-center space-y-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setConfirmTier(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            
            <div className="space-y-2.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Konfirmasi Pendaftaran</h3>
              <p className="text-sm sm:text-base text-slate-550 font-bold leading-relaxed px-2">
                Apakah Anda yakin ingin mengajukan pendaftaran/upgrade ke paket <span className="text-primary font-black">{plans.find(p => p.id === confirmTier)?.name}</span>?
              </p>
            </div>
            
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setConfirmTier(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-sm transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const tier = confirmTier;
                  setConfirmTier(null);
                  executeUpgrade(tier);
                }}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-black rounded-xl text-sm transition-all shadow-md shadow-primary/15 cursor-pointer"
              >
                Ya, Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
