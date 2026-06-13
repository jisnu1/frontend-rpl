import React from 'react';
import { FileText } from 'lucide-react';

interface HistoryEntry {
  date: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
}

interface TokenTrendChartProps {
  history?: HistoryEntry[];
  formatDate: (dateStr: string) => string;
}

export default function TokenTrendChart({
  history = [],
  formatDate
}: TokenTrendChartProps) {
  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/40">
      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-6">
        Tren Penggunaan Token AI Harian (7 Hari Terakhir)
      </h3>
      
      {!history || history.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
          <FileText className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-bold">Belum ada histori penggunaan token tercatat.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart bars */}
          <div className="flex justify-between items-end h-60 gap-4 px-2 sm:px-6">
            {history.map((entry, idx) => {
              const maxVal = Math.max(...history.map(h => h.totalTokens), 1);
              const heightPercent = (entry.totalTokens / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 bg-slate-800 text-white rounded-xl py-2 px-3 text-[10px] font-bold shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 flex flex-col gap-1 border border-slate-700">
                    <span className="text-slate-300">{formatDate(entry.date).split(',')[0]}</span>
                    <span className="text-indigo-400">Total: {entry.totalTokens.toLocaleString('id-ID')}</span>
                    <span className="text-slate-400">Prompt: {entry.inputTokens.toLocaleString('id-ID')}</span>
                    <span className="text-slate-400">Gen: {entry.outputTokens.toLocaleString('id-ID')}</span>
                  </div>

                  {/* Bar Graphic */}
                  <div className="w-full bg-slate-200 rounded-t-lg hover:bg-slate-300 transition-colors h-full flex flex-col justify-end overflow-hidden">
                    <div 
                      className="bg-indigo-500 rounded-t-lg group-hover:bg-indigo-600 transition-all duration-500 shadow-sm shadow-indigo-500/10" 
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    ></div>
                  </div>

                  {/* Label (date short) */}
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                    {entry.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-slate-200 flex justify-center gap-6 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span>
              <span>Total Token (Input + Output)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
