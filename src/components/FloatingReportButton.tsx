import React, { useState, useRef, useEffect } from 'react';
import { X, MessageSquareWarning, Send, CheckCircle } from 'lucide-react';
import { submitBugReport } from '../api/reports';
import { useToast } from '../context/ToastContext';

export default function FloatingReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { error: toastError } = useToast();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset state when closing
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription('');
    }, 300);
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await submitBugReport(description);
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Auto-close after showing success state
      setTimeout(() => {
        handleClose();
      }, 2200);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      toastError('Gagal mengirimkan laporan bug. Silakan coba lagi.');
    }
  };

  const canSubmit = description.trim().length >= 5;

  return (
    <div ref={formRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Form Panel */}
      <div
        className={`w-[340px] bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,82,204,0.18),0_8px_25px_rgba(0,0,0,0.12)] border border-slate-100/80 overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
        style={{ maxHeight: isOpen ? '520px' : '0px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0052cc] to-[#1a6ee8] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <MessageSquareWarning className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Laporkan Masalah / Bug</p>
              <p className="text-white/65 text-[10px] font-semibold mt-0.5">Horizon Cloud · Feedback</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isSubmitted ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-6 gap-3 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 text-sm">Laporan Terkirim!</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Terima kasih. Tim kami akan segera menindaklanjuti laporan Anda.
                </p>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Description Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Deskripsi Kendala
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan secara singkat apa yang terjadi, langkah untuk mereproduksi masalah, dan perilaku yang diharapkan..."
                  className="w-full resize-none border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-350 bg-white focus:outline-none focus:ring-2 focus:ring-[#0052cc]/30 focus:border-[#0052cc]/40 transition-all leading-relaxed"
                />
                <p className={`text-[10px] font-semibold mt-1 text-right transition-colors ${
                  description.length < 5 && description.length > 0 ? 'text-rose-400' : 'text-slate-350'
                }`}>
                  {description.length} / 500
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={`flex-[2] px-4 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    canSubmit && !isSubmitting
                      ? 'bg-[#0052cc] hover:bg-[#0040a0] shadow-[0_4px_15px_rgba(0,82,204,0.35)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Floating Trigger Button */}
      <button
        onClick={handleToggle}
        aria-label="Laporkan Bug"
        className={`group relative w-14 h-14 rounded-full bg-[#0052cc] text-white shadow-xl hover:shadow-[0_12px_30px_rgba(0,82,204,0.45)] hover:-translate-y-1.5 active:translate-y-0 active:shadow-lg transition-all duration-300 ease-out cursor-pointer select-none flex items-center justify-center ${
          isOpen ? 'rotate-90 bg-slate-600 shadow-none' : ''
        }`}
      >
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[#0052cc]/30 group-hover:opacity-0 transition-opacity" />
        )}

        {isOpen ? (
          <X className="w-5 h-5 transition-transform duration-300" />
        ) : (
          <span className="text-xl font-black leading-none select-none">?</span>
        )}
      </button>
    </div>
  );
}
