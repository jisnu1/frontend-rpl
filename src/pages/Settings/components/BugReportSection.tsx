import React from 'react';
import { MessageSquareWarning, CheckCircle, Send, Loader2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface BugReportSectionProps {
  isReportSubmitted: boolean;
  setIsReportSubmitted: (val: boolean) => void;
  reportDescription: string;
  setReportDescription: (val: string) => void;
  isSubmittingReport: boolean;
  reportLockoutTime: number;
  reportRemainingAttempts: number | null;
  handleReportSubmit: (e: React.FormEvent) => void;
  formatReportTime: (seconds: number) => string;
}

export default function BugReportSection({
  isReportSubmitted,
  setIsReportSubmitted,
  reportDescription,
  setReportDescription,
  isSubmittingReport,
  reportLockoutTime,
  reportRemainingAttempts,
  handleReportSubmit,
  formatReportTime
}: BugReportSectionProps) {
  return (
    <Card hoverLift={false} className="p-6 md:p-8 animate-fadeIn">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
        <MessageSquareWarning className="text-primary w-5 h-5" />
        <h2 className="text-base font-bold text-slate-800">Laporkan Masalah / Bug</h2>
      </div>

      <p className="text-xs text-slate-450 font-semibold mb-6 leading-relaxed">
        Ceritakan kendala atau masalah yang Anda temukan saat menggunakan Horizon Drive. Deskripsi yang jelas membantu kami mengidentifikasi dan memperbaiki bug dengan lebih cepat.
      </p>

      {isReportSubmitted ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="text-center max-w-sm">
            <h4 className="font-bold text-slate-800 text-sm">Laporan Berhasil Terkirim!</h4>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed font-semibold">
              Terima kasih atas kontribusi Anda. Tim developer Horizon Cloud akan segera meninjau dan menindaklanjuti kendala ini.
            </p>
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => {
              setIsReportSubmitted(false);
              setReportDescription('');
            }}
            className="mt-2 cursor-pointer"
          >
            Kirim Laporan Baru
          </Button>
        </div>
      ) : (
        <form onSubmit={handleReportSubmit} className="space-y-5">
          {reportLockoutTime > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
              <span>Terlalu banyak mengirim laporan. Coba lagi dalam {formatReportTime(reportLockoutTime)}.</span>
            </div>
          )}

          {reportRemainingAttempts !== null && reportRemainingAttempts > 0 && reportRemainingAttempts <= 2 && reportLockoutTime <= 0 && (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50 flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>Tersisa {reportRemainingAttempts} kali pengiriman laporan lagi dalam jam ini.</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Deskripsi Kendala
            </label>
            <textarea
              rows={6}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value.substring(0, 500))}
              placeholder="Ceritakan secara singkat kendala apa yang terjadi, langkah untuk mereproduksi masalah, dan hasil yang diharapkan..."
              disabled={isSubmittingReport || reportLockoutTime > 0}
              className="w-full resize-none border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-xs font-semibold text-slate-700 placeholder-slate-350 bg-slate-50/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all leading-relaxed disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              required
            />
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>Minimal 5 karakter</span>
              <span className={reportDescription.length < 5 && reportDescription.length > 0 ? 'text-rose-500' : ''}>
                {reportDescription.length} / 500
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-50">
            <Button
              type="submit"
              variant="primary"
              disabled={reportDescription.trim().length < 5 || isSubmittingReport || reportLockoutTime > 0}
              isLoading={isSubmittingReport}
              className="px-6 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Send className="w-4 h-4 mr-2" />
              {reportLockoutTime > 0 ? `Terkunci (${formatReportTime(reportLockoutTime)})` : 'Kirim Laporan'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
