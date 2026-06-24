import React, { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles, X, BookOpen, User as UserIcon, CreditCard } from 'lucide-react';
import { requestSubscriptionUpgrade, fetchMySubscriptionRequest, fetchUserProfile, cancelSubscriptionRequest } from '../../api/auth';
import { sendAcademicOtp, verifyAcademicOtp } from '../../api/academicAuth';
import { SubscriptionRequest } from '../../types/auth.types';
import { useAuth } from '../../context/AuthContext';

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
  const { updateUserProfileState, accessToken, user } = useAuth();
  const [pendingRequest, setPendingRequest] = useState<SubscriptionRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedDetailPlan, setSelectedDetailPlan] = useState<any | null>(null);
  const [confirmTier, setConfirmTier] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  // States for academic email verification
  const [academicVerificationOpen, setAcademicVerificationOpen] = useState(false);
  const [emailKampus, setEmailKampus] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifyingStep, setVerifyingStep] = useState<'input' | 'otp'>('input');
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicSuccess, setAcademicSuccess] = useState<string | null>(null);
  const [academicError, setAcademicError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPendingRequest();
    }
  }, [isOpen]);

  useEffect(() => {
    const snapSrcUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const myClientKey = 'Mid-client-Mv227tkUBoVcye1Y';
    
    let script = document.querySelector(`script[src="${snapSrcUrl}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = snapSrcUrl;
      script.setAttribute('data-client-key', myClientKey);
      document.body.appendChild(script);
    }
  }, []);

  const loadPendingRequest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const req = await fetchMySubscriptionRequest();
      setPendingRequest(req);
      if (req && req.status === 'PENDING' && req.invoiceUrl) {
        setInvoiceUrl(req.invoiceUrl);
      } else {
        setInvoiceUrl(null);
        // Update user profile globally if there is no pending transaction
        try {
          const profile = await fetchUserProfile(accessToken || undefined);
          updateUserProfileState(profile);
        } catch (profileErr) {
          console.error("Gagal memperbarui profil user setelah cek pembayaran:", profileErr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (tier: string) => {
    if (tier === 'PREMIUM_ACADEMIC' && !user?.studentVerified) {
      setAcademicVerificationOpen(true);
      setVerifyingStep('input');
      setEmailKampus('');
      setOtpCode('');
      setAcademicError(null);
      setAcademicSuccess(null);
    } else {
      setConfirmTier(tier);
    }
  };

  const handleSendAcademicOtp = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!emailKampus || !emailKampus.trim()) {
      setAcademicError("Email kampus tidak boleh kosong.");
      return;
    }
    setAcademicLoading(true);
    setAcademicError(null);
    setAcademicSuccess(null);
    try {
      await sendAcademicOtp(emailKampus.trim());
      setAcademicSuccess(`Kode OTP berhasil dikirim ke ${emailKampus.trim()}`);
      setVerifyingStep('otp');
    } catch (err: any) {
      setAcademicError(err.response?.data?.message || "Gagal mengirimkan OTP. Pastikan domain email kampus valid dan belum digunakan.");
    } finally {
      setAcademicLoading(false);
    }
  };

  const handleVerifyAcademicOtp = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!otpCode || !otpCode.trim()) {
      setAcademicError("Kode OTP tidak boleh kosong.");
      return;
    }
    setAcademicLoading(true);
    setAcademicError(null);
    setAcademicSuccess(null);
    try {
      await verifyAcademicOtp(emailKampus.trim(), otpCode.trim());
      
      // Update global context user state
      try {
        const profile = await fetchUserProfile(accessToken || undefined);
        updateUserProfileState(profile);
      } catch (profileErr) {
        console.error("Gagal refresh profil setelah verifikasi akademis:", profileErr);
      }

      setAcademicSuccess("Email kampus berhasil diverifikasi!");
    } catch (err: any) {
      setAcademicError(err.response?.data?.message || "Kode OTP salah atau telah kedaluwarsa.");
    } finally {
      setAcademicLoading(false);
    }
  };

  const executeUpgrade = async (tier: string) => {
    setActionLoading(tier);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await requestSubscriptionUpgrade(tier);
      setPendingRequest(res);
      if (res && res.invoiceUrl) {
        setInvoiceUrl(res.invoiceUrl);
      } else {
        setSuccessMsg("Permintaan upgrade berhasil diajukan! Silakan hubungi admin.");
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal mengajukan permintaan upgrade. Silakan coba lagi.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelPayment = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await cancelSubscriptionRequest();
      setInvoiceUrl(null);
      setPendingRequest(null);
      await loadPendingRequest();
    } catch (err: any) {
      setErrorMsg("Gagal membatalkan tagihan pembayaran. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchSnap = () => {
    if (!pendingRequest || !pendingRequest.xenditInvoiceId) {
      setErrorMsg("Token pembayaran tidak ditemukan. Silakan hubungi admin.");
      return;
    }
    
    const snapToken = pendingRequest.xenditInvoiceId;
    
    if (!(window as any).snap) {
      setErrorMsg("SDK Pembayaran Midtrans belum termuat. Silakan tunggu sebentar atau refresh halaman.");
      return;
    }

    (window as any).snap.pay(snapToken, {
      onSuccess: async (result: any) => {
        setLoading(true);
        await loadPendingRequest();
        if (onSuccess) onSuccess();
      },
      onPending: async (result: any) => {
        setLoading(true);
        await loadPendingRequest();
      },
      onError: (result: any) => {
        setErrorMsg("Proses pembayaran gagal atau dibatalkan oleh sistem.");
      },
      onClose: () => {
        loadPendingRequest();
      }
    });
  };

  if (!isOpen) return null;

  const plans = [
    {
      id: 'FREEMIUM',
      name: 'Freemium',
      icon: UserIcon,
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
      price: 'Rp 20.000 / bulan',
      originalPrice: 'Rp 30.000',
      discountPercentage: 'Hemat 33%',
      color: 'amber',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm shadow-amber-500/5',
      features: [
        { label: 'Penyimpanan 15 GB', isAvailable: true },
        { label: 'Maksimal 10 Akun Cloud', isAvailable: true },
        { label: '50 Permintaan AI per hari', isAvailable: true },
        { label: 'Migrasi Berkas Tanpa Batas', isAvailable: true },
        { label: 'Ukuran file migrasi Tanpa Batas', isAvailable: true },
        { label: 'Link Share & Privat Tanpa Batas', isAvailable: true }
      ],
      details: [
        'Kapasitas Penyimpanan: 15 Gigabyte (GB) penyimpanan super lega.',
        'Akun Cloud Eksternal: Menghubungkan hingga 10 akun cloud eksternal sekaligus.',
        'Ringkasan AI: Batas maksimal 50 permintaan ringkasan teks atau PDF per hari.',
        'Migrasi Berkas: Bebas melakukan migrasi berkas tanpa batasan frekuensi harian maupun batasan ukuran berkas.',
        'Tautan Berbagi Aktif: Bebas membuat tautan berbagi publik maupun privat tanpa batasan kuota.'
      ]
    },
    {
      id: 'PREMIUM_ACADEMIC',
      name: 'Premium Academic',
      icon: BookOpen,
      price: 'Rp 15.000 / bulan',
      originalPrice: 'Rp 25.000',
      discountPercentage: 'Hemat 40%',
      color: 'cyan',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200 shadow-sm shadow-cyan-500/5',
      features: [
        { label: 'Penyimpanan 10 GB', isAvailable: true },
        { label: 'Maksimal 5 Akun Cloud', isAvailable: true },
        { label: '30 Permintaan AI per hari', isAvailable: true },
        { label: '30 Migrasi per hari (Maks 10 GB)', isAvailable: true },
        { label: '100 Link Share Publik Aktif', isAvailable: true },
        { label: '100 Share Privat Aktif', isAvailable: true },
        { label: 'Ukuran file migrasi Tanpa Batas', isAvailable: false }
      ],
      details: [
        'Kapasitas Penyimpanan: 10 Gigabyte (GB) penyimpanan untuk kebutuhan akademik.',
        'Akun Cloud Eksternal: Menghubungkan hingga 5 akun cloud eksternal sekaligus.',
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
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {invoiceUrl ? 'Pembayaran Tagihan Langganan' : 'Upgrade Kapasitas Penyimpanan'}
          </h2>
          <p className="text-sm text-slate-500 font-bold mt-1.5">
            {invoiceUrl 
              ? 'Selesaikan pembayaran tagihan Anda di bawah untuk mengaktifkan paket.' 
              : 'Pilih paket langganan terbaik. Klik kartu paket untuk melihat detail deskripsi lengkap.'}
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
          ) : invoiceUrl ? (
            (() => {
              const requestedPlan = plans.find(p => p.id === pendingRequest?.requestedTier);
              const planName = requestedPlan?.name || (pendingRequest?.requestedTier === 'PREMIUM_INDIVIDUAL' ? 'Premium Individual' : 'Premium Academic');
              const amount = pendingRequest?.amount || (pendingRequest?.requestedTier === 'PREMIUM_INDIVIDUAL' ? 20000 : 15000);

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-6 max-w-lg mx-auto shadow-sm my-4">
                  <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shadow-inner">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Pembayaran Menunggu Penyelesaian</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1.5">
                      Anda memiliki transaksi upgrade aktif untuk paket <span className="text-slate-800">{planName}</span>
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-slate-150 text-left space-y-3 shadow-sm">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-wider">
                      <span>METODE PEMBAYARAN</span>
                      <span>MIDTRANS SANDBOX</span>
                    </div>
                    <div className="border-t border-slate-100 my-2"></div>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                      <span>Total Tagihan:</span>
                      <span className="text-lg font-black text-primary">
                        Rp {amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={handleLaunchSnap}
                      className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-black rounded-xl text-sm transition-all shadow-md shadow-primary/15 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Bayar Sekarang (Midtrans)
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelPayment}
                        className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-black rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Batalkan & Pilih Paket Lain
                      </button>
                      <button
                        onClick={async () => {
                          setLoading(true);
                          await loadPendingRequest();
                          if (onSuccess) onSuccess();
                        }}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-black rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Cek Status
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
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
                  buttonText = 'Selesaikan Pembayaran';
                  buttonStyle = 'bg-amber-500 text-white hover:bg-amber-650 shadow-md shadow-amber-500/10 cursor-pointer';
                  isDisabled = false; // Allow user to click to open pending invoice!
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
                        ? 'border-amber-450 bg-amber-50/30'
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
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                          plan.color === 'amber'
                            ? 'bg-amber-50 text-amber-600 border-amber-250 shadow-sm'
                            : plan.color === 'cyan'
                            ? 'bg-cyan-50 text-cyan-600 border-cyan-250 shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-black text-slate-800 leading-none mb-1.5">{plan.name}</h4>
                          {plan.originalPrice ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-semibold text-slate-400 line-through leading-none">{plan.originalPrice}</span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 animate-pulse ${
                                  plan.color === 'amber'
                                    ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
                                    : 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-sm'
                                }`}>
                                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                  {plan.discountPercentage}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className={`text-xl font-extrabold tracking-tight leading-tight ${
                                  plan.color === 'amber' ? 'text-amber-600' : 'text-cyan-600'
                                }`}>
                                  {plan.price.split(' /')[0]}
                                </span>
                                <span className="text-[10px] font-bold text-slate-505">/ bulan</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight block">
                              {plan.price}
                            </span>
                          )}
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
                          if (isPendingThis && pendingRequest && pendingRequest.invoiceUrl) {
                            setInvoiceUrl(pendingRequest.invoiceUrl);
                          } else {
                            handleUpgradeClick(plan.id);
                          }
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

      {/* Academic Email Verification Overlay */}
      {academicVerificationOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn" onClick={() => setAcademicVerificationOpen(false)}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative p-6 sm:p-8 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setAcademicVerificationOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-6">
              {/* Header Icon */}
              <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-200 shadow-sm shadow-cyan-500/5">
                <BookOpen className="w-7 h-7" />
              </div>
              
              {/* Titles */}
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Verifikasi Mahasiswa</h3>
                <p className="text-xs sm:text-sm text-slate-550 font-bold px-2 leading-relaxed">
                  Gunakan email kampus resmi (seperti domain <span className="text-cyan-650 font-black">.ac.id</span> atau <span className="text-cyan-655 font-black">.edu</span>) untuk verifikasi status mahasiswa Anda dan klaim diskon akademik.
                </p>
              </div>

              {/* Status Banner */}
              {academicError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3 rounded-2xl text-left">
                  {academicError}
                </div>
              )}
              {academicSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl text-left">
                  {academicSuccess}
                </div>
              )}

              {/* Steps Form */}
              {verifyingStep === 'input' ? (
                <form onSubmit={handleSendAcademicOtp} className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label htmlFor="academic-email" className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                      Email Kampus
                    </label>
                    <input
                      id="academic-email"
                      type="email"
                      required
                      placeholder="mahasiswa@univ.ac.id"
                      value={emailKampus}
                      onChange={(e) => setEmailKampus(e.target.value)}
                      disabled={academicLoading}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={academicLoading}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-xl text-sm transition-all shadow-md shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {academicLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Kirim Kode OTP</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAcademicOtp} className="space-y-4 text-left">
                  {user?.studentVerified ? (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                        <Check className="w-8 h-8 text-emerald-500 shrink-0 bg-white rounded-full p-1.5 border border-emerald-250" />
                        <div>
                          <p className="text-sm font-black text-slate-800">Verifikasi Sukses</p>
                          <p className="text-xs font-bold text-slate-550">Email {emailKampus} telah terhubung.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAcademicVerificationOpen(false);
                          setConfirmTier('PREMIUM_ACADEMIC');
                        }}
                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-black rounded-xl text-sm transition-all shadow-md shadow-primary/10 cursor-pointer"
                      >
                        Lanjutkan ke Pembayaran
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="otp-code" className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                          Masukkan 6-Digit OTP
                        </label>
                        <input
                          id="otp-code"
                          type="text"
                          required
                          maxLength={6}
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          disabled={academicLoading}
                          className="w-full text-center tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={academicLoading}
                          onClick={() => {
                            setVerifyingStep('input');
                            setAcademicError(null);
                            setAcademicSuccess(null);
                          }}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-sm transition-all cursor-pointer"
                        >
                          Ubah Email
                        </button>
                        <button
                          type="submit"
                          disabled={academicLoading}
                          className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-xl text-sm transition-all shadow-md shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2"
                        >
                          {academicLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          <span>Verifikasi OTP</span>
                        </button>
                      </div>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          disabled={academicLoading}
                          onClick={handleSendAcademicOtp}
                          className="text-xs font-black text-cyan-600 hover:text-cyan-700 cursor-pointer"
                        >
                          Kirim Ulang Kode OTP
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
