import React, { useState, useEffect } from 'react';
import { Share2, Mail, AlertCircle, CheckCircle2, Copy, Clock, Globe, User, Check, ChevronDown } from 'lucide-react';
import { shareFile } from '../api/shared';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId?: string;
  fileName?: string;
  provider?: string;
}

type ShareTab = 'private' | 'public';
type ExpiryOption = 'infinite' | '1h' | '1d' | '7d' | 'custom';

const expiryOptions = [
  { value: 'infinite', label: 'Tanpa Batas Waktu', desc: 'Akses berlaku selamanya' },
  { value: '1h', label: '1 Jam', desc: 'Masa aktif selama 60 menit' },
  { value: '1d', label: '1 Hari', desc: 'Kadaluarsa setelah 24 jam' },
  { value: '7d', label: '7 Hari', desc: 'Kadaluarsa setelah 7 hari' },
  { value: 'custom', label: 'Kustom...', desc: 'Tentukan batas waktu sendiri' },
];

export default function ShareModal({ isOpen, onClose, fileId, fileName, provider }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('private');
  const [email, setEmail] = useState('');
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>('infinite');
  const [customDays, setCustomDays] = useState<number>(0);
  const [customHours, setCustomHours] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isSharing, setIsSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setExpiryOption('infinite');
      setCustomDays(0);
      setCustomHours(0);
      setErrorMessage('');
      setIsSharing(false);
      setIsComplete(false);
      setGeneratedLink('');
      setIsCopied(false);
      setActiveTab('private');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileId) return;

    setIsSharing(true);
    setErrorMessage('');

    let expiresInDays: number | undefined = undefined;
    let expiresInHours: number | undefined = undefined;

    if (expiryOption === '1h') {
      expiresInHours = 1;
    } else if (expiryOption === '1d') {
      expiresInDays = 1;
    } else if (expiryOption === '7d') {
      expiresInDays = 7;
    } else if (expiryOption === 'custom') {
      if (customDays > 0) expiresInDays = customDays;
      if (customHours > 0) expiresInHours = customHours;
    }

    try {
      const response = await shareFile(fileId, {
        email: activeTab === 'private' ? email.trim() : undefined,
        isPublic: activeTab === 'public',
        expiresInDays,
        expiresInHours,
      }, provider);

      if (activeTab === 'public' && response.shareLink) {
        setGeneratedLink(response.shareLink);
        toastSuccess('Tautan publik berhasil dibuat.');
      } else {
        setIsComplete(true);
        toastSuccess(`Akses berkas "${fileName}" berhasil dibagikan ke ${email}.`);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Gagal membagikan akses berkas.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    toastSuccess('Tautan berhasil disalin.');
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagikan Berkas" icon={Share2}>
      <div className="space-y-4">
        {generatedLink ? (
          <div className="space-y-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-indigo-700">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-xs">Tautan Publik Berhasil Dibuat</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              Kirim atau bagikan tautan berikut ke siapa saja. Siapa pun yang memiliki tautan dapat mengunduh dan melihat pratinjau berkas secara anonim.
            </p>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full p-1.5 pl-3">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="w-full text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center justify-center p-2 rounded-full transition-all shrink-0 ${
                  isCopied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="button" variant="primary" size="sm" onClick={onClose}>
                Selesai
              </Button>
            </div>
          </div>
        ) : isComplete ? (
          <div className="text-center py-6 flex flex-col items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Berhasil Dibagikan!</h4>
              <p className="text-xs text-slate-450 mt-1 font-semibold">Akses berkas berhasil dibagikan ke pengguna lain.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Tab Selector */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => { setActiveTab('private'); setErrorMessage(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'private'
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Bagikan Privat
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('public'); setErrorMessage(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'public'
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Tautan Publik
              </button>
            </div>

            {/* Email Field (Private share only) */}
            {activeTab === 'private' && (
              <div className="animate-fadeIn">
                <p className="text-xs text-slate-500 font-semibold mb-3 leading-relaxed">
                  Bagikan akses berkas <strong className="text-slate-800 font-bold">"{fileName}"</strong> kepada pengguna tertentu dengan memasukkan alamat email mereka.
                </p>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Alamat Email Pengguna
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    disabled={isSharing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Expiration Fields */}
            <div className="space-y-3">
              {activeTab === 'public' && (
                <p className="text-xs text-slate-500 font-semibold mb-1 leading-relaxed animate-fadeIn">
                  Buat tautan publik untuk berkas <strong className="text-slate-800 font-bold">"{fileName}"</strong>. Siapa pun yang memiliki tautan dapat mengaksesnya.
                </p>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Masa Kadaluarsa Akses
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 px-4 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/50 hover:border-slate-350 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{expiryOptions.find(opt => opt.value === expiryOption)?.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-[0px_10px_25px_rgba(15,23,42,0.08)] p-1.5 z-20 animate-fadeIn space-y-0.5">
                        {expiryOptions.map((opt) => {
                          const isSelected = opt.value === expiryOption;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setExpiryOption(opt.value as ExpiryOption);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl transition-all ${
                                isSelected 
                                  ? 'bg-primary/5 text-primary' 
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className={`text-xs ${isSelected ? 'font-bold' : 'font-semibold'}`}>
                                  {opt.label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {opt.desc}
                                </span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {expiryOption === 'custom' && (
                <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Hari
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customDays}
                      onChange={(e) => setCustomDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Jam
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={customHours}
                      onChange={(e) => setCustomHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center"
                    />
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-tight">{errorMessage}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSharing}>
                Batal
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                size="sm" 
                disabled={activeTab === 'private' ? (!email.trim() || isSharing) : isSharing}
                isLoading={isSharing}
              >
                {activeTab === 'private' ? 'Bagikan Akses' : 'Buat Tautan Publik'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
