import React, { useState, useEffect } from 'react';
import { Share2, Clock, Globe, Copy, Check, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { shareFolder, ShareFolderRequest } from '../api/sharedFolders';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface FolderShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
  folderName?: string;
  folderType?: 'LOCAL' | 'GOOGLE_DRIVE';
}

type ExpiryOption = 'infinite' | '1h' | '1d' | '7d' | 'custom';

const expiryOptions = [
  { value: 'infinite', label: 'Tanpa Batas Waktu', desc: 'Akses berlaku selamanya' },
  { value: '1h', label: '1 Jam', desc: 'Masa aktif selama 60 menit' },
  { value: '1d', label: '1 Hari', desc: 'Kadaluarsa setelah 24 jam' },
  { value: '7d', label: '7 Hari', desc: 'Kadaluarsa setelah 7 hari' },
  { value: 'custom', label: 'Kustom...', desc: 'Tentukan batas waktu sendiri' },
];

export default function FolderShareModal({
  isOpen,
  onClose,
  folderId,
  folderName,
  folderType = 'LOCAL',
}: FolderShareModalProps) {
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [allowAnonymous, setAllowAnonymous] = useState<boolean>(true);
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>('infinite');
  const [customDays, setCustomDays] = useState<number>(0);
  const [customHours, setCustomHours] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isSharing, setIsSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (isOpen) {
      setPermission('VIEW');
      setAllowAnonymous(true);
      setExpiryOption('infinite');
      setCustomDays(0);
      setCustomHours(0);
      setErrorMessage('');
      setIsSharing(false);
      setGeneratedLink('');
      setIsCopied(false);
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderId) return;

    setIsSharing(true);
    setErrorMessage('');

    let expiresAt: string | null = null;
    const now = new Date();

    if (expiryOption === '1h') {
      now.setHours(now.getHours() + 1);
      expiresAt = now.toISOString();
    } else if (expiryOption === '1d') {
      now.setDate(now.getDate() + 1);
      expiresAt = now.toISOString();
    } else if (expiryOption === '7d') {
      now.setDate(now.getDate() + 7);
      expiresAt = now.toISOString();
    } else if (expiryOption === 'custom') {
      let totalMinutes = 0;
      if (customDays > 0) totalMinutes += customDays * 24 * 60;
      if (customHours > 0) totalMinutes += customHours * 60;
      if (totalMinutes > 0) {
        now.setMinutes(now.getMinutes() + totalMinutes);
        expiresAt = now.toISOString();
      }
    }

    try {
      const response = await shareFolder({
        folderId,
        folderType,
        permission,
        allowAnonymous,
        expiresAt,
      });

      const providerPrefix = folderType === 'GOOGLE_DRIVE' ? 'google' : 'local';
      const link = `${window.location.origin}/shared/public/${providerPrefix}/${response.shareToken}`;
      setGeneratedLink(link);
      toastSuccess('Tautan folder bersama berhasil dibuat.');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Gagal membagikan folder bersama.';
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
    toastSuccess('Tautan disalin.');
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagikan Folder" icon={Share2}>
      <div className="space-y-4">
        {generatedLink ? (
          <div className="space-y-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-indigo-700">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-xs">Tautan Publik Folder Bersama Berhasil Dibuat</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              Kirim atau bagikan tautan berikut ke kolaborator Anda. Siapa pun yang memiliki tautan dapat mengakses, mengunduh,
              dan (jika diizinkan) mengunggah/menghapus file di folder bersama ini.
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-3 leading-relaxed">
                Buat tautan kolaborasi publik untuk folder <strong className="text-slate-800 font-bold">"{folderName}"</strong>.
              </p>
            </div>

            {/* Permission Option */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Hak Akses Folder
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPermission('VIEW')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border-2 transition-all ${
                    permission === 'VIEW'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Hanya Lihat (VIEW)
                </button>
                <button
                  type="button"
                  onClick={() => setPermission('EDIT')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border-2 transition-all ${
                    permission === 'EDIT'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  Lihat & Edit (EDIT)
                </button>
              </div>
            </div>

            {/* Allow Anonymous (Only applicable for EDIT permission) */}
            {permission === 'EDIT' && (
              <div className="flex items-center justify-between bg-slate-50/70 border border-slate-100 rounded-xl p-3 animate-fadeIn">
                <div className="text-left pr-4">
                  <h5 className="text-xs font-bold text-slate-700">Izinkan Kolaborasi Anonim</h5>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Membolehkan siapa saja mengunggah/menghapus file tanpa harus masuk akun.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowAnonymous(!allowAnonymous)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    allowAnonymous ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowAnonymous ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Expiry Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Masa Kadaluarsa Link
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 px-4 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/50 hover:border-slate-350 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{expiryOptions.find((opt) => opt.value === expiryOption)?.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
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
                              isSelected ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className={`text-xs ${isSelected ? 'font-bold' : 'font-semibold'}`}>
                                {opt.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">{opt.desc}</span>
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
              <Button type="submit" variant="primary" size="sm" isLoading={isSharing}>
                Buat Tautan Folder Bersama
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
