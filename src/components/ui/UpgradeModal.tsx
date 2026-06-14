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

  const handleUpgrade = async (tier: string) => {
    const planName = plans.find(p => p.id === tier)?.name || tier;
    const confirmUpgrade = window.confirm(`Apakah Anda yakin ingin mengajukan pendaftaran/upgrade ke paket ${planName}?`);
    if (!confirmUpgrade) return;

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
        'Penyimpanan 1 GB',
        'Maksimal 1 Akun Cloud',
        '5 Permintaan AI per hari',
        '3 Migrasi per hari (Maks 256 MB)',
        '30 Link Share Publik Aktif',
        '30 Share Privat Aktif'
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
        'Penyimpanan 15 GB',
        'Maksimal 5 Akun Cloud',
        '50 Permintaan AI per hari',
        'Migrasi Tanpa Batas',
        'Ukuran file migrasi Tanpa Batas',
        'Link Share & Privat Tanpa Batas'
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
        'Penyimpanan 10 GB',
        'Maksimal 3 Akun Cloud',
        '30 Permintaan AI per hari',
        '30 Migrasi per hari (Maks 10 GB)',
        '100 Link Share Publik Aktif',
        '100 Share Privat Aktif'
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
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-50 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Upgrade Kapasitas Penyimpanan</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Pilih paket langganan terbaik. Klik kartu paket untuk melihat detail lebih lengkap.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh] space-y-6">
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3 rounded-2xl">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
                    className={`border rounded-3xl p-5 flex flex-col justify-between transition-all relative cursor-pointer hover:shadow-lg ${
                      isCurrent 
                        ? 'border-primary shadow-lg ring-1 ring-primary/20 bg-primary/5' 
                        : isPendingThis
                        ? 'border-amber-400 bg-amber-50/30'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[9px] font-extrabold bg-primary text-white uppercase tracking-wider">
                        Aktif
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                          plan.color === 'amber'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : plan.color === 'cyan'
                            ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{plan.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400">{plan.price}</p>
                        </div>
                      </div>

                      {/* Plan Features */}
                      <ul className="space-y-2 pt-2">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[10px] font-bold text-slate-650 leading-tight">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Plan Button */}
                    <div className="pt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpgrade(plan.id);
                        }}
                        disabled={isDisabled || actionLoading !== null}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${buttonStyle}`}
                      >
                        {actionLoading === plan.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedDetailPlan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-4">
              <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center border ${
                selectedDetailPlan.color === 'amber'
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : selectedDetailPlan.color === 'cyan'
                  ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {React.createElement(selectedDetailPlan.icon, { className: "w-6 h-6" })}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Detail Paket {selectedDetailPlan.name}</h3>
                <p className="text-xs text-slate-450 font-bold mt-0.5">{selectedDetailPlan.price}</p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Apa yang Anda Dapatkan:</p>
                <ul className="space-y-2.5">
                  {selectedDetailPlan.details.map((detail: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-650 leading-relaxed">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => setSelectedDetailPlan(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
