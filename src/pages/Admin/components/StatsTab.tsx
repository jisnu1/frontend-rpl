import React from 'react';
import { Clock, Database, CheckCircle2, Download } from 'lucide-react';
import StatsCard from './StatsCard';
import TokenTrendChart from './TokenTrendChart';
import { AiTokenStats } from '../../../api/admin';

interface StatsTabProps {
  tokenStats: AiTokenStats | null;
  formatDate: (dateStr: string) => string;
  onDownloadCsv: () => void;
}

export default function StatsTab({
  tokenStats,
  formatDate,
  onDownloadCsv
}: StatsTabProps) {
  return (
    <div className="space-y-8 flex-1">
      {/* Export Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Statistik Penggunaan AI</h3>
        <button
          onClick={onDownloadCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download CSV Log Token</span>
        </button>
      </div>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Token Hari Ini"
          value={tokenStats?.todayTotalTokens.toLocaleString('id-ID') || 0}
          subtitle="Total token masuk & keluar"
          icon={Clock}
          color="indigo"
          footer={
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Prompt: {tokenStats?.todayInputTokens.toLocaleString('id-ID') || 0}</span>
              <span>Gen: {tokenStats?.todayOutputTokens.toLocaleString('id-ID') || 0}</span>
            </div>
          }
        />

        <StatsCard
          title="Token Bulan Ini"
          value={tokenStats?.monthTotalTokens.toLocaleString('id-ID') || 0}
          subtitle="Akumulasi penggunaan bulan ini"
          icon={Database}
          color="emerald"
          footer={
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Prompt: {tokenStats?.monthInputTokens.toLocaleString('id-ID') || 0}</span>
              <span>Gen: {tokenStats?.monthOutputTokens.toLocaleString('id-ID') || 0}</span>
            </div>
          }
        />

        <StatsCard
          title="Status Service AI"
          value="Aktif & Stabil"
          subtitle="Mendukung Groq & Gemini"
          icon={CheckCircle2}
          color="violet"
          footer={
            <div className="text-[10px] text-slate-400 font-bold">
              Batas default request user baru: 5 kali / hari
            </div>
          }
        />
      </div>

      {/* Token Trend Chart */}
      <TokenTrendChart history={tokenStats?.history} formatDate={formatDate} />
    </div>
  );
}
