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
        '3 Migrasi per bulan (Maks 256 MB)',
        '30 Link Share Publik Aktif',
        '30 Share Privat Aktif'
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
        'Migrasi Tanpa Batas',
        'Ukuran file migrasi Tanpa Batas',
        '100 Link Share Publik Aktif',
        '100 Share Privat Aktif'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Upgrade Kapasitas Penyimpanan</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Pilih paket langganan terbaik untuk kebutuhan produktivitas Anda.
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
                    className={`border rounded-3xl p-5 flex flex-col justify-between transition-all relative ${
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
                          <li key={idx} className="flex items-start gap-2 text-[10px] font-bold text-slate-600 leading-tight">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Plan Button */}
                    <div className="pt-6">
                      <button
                        onClick={() => handleUpgrade(plan.id)}
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
    </div>
  );
}
