import React from 'react';
import { Terminal } from 'lucide-react';

interface PromptConfigCardProps {
  summaryPrompt: string;
  chatPrompt: string;
  onSummaryPromptChange: (val: string) => void;
  onChatPromptChange: (val: string) => void;
}

export default function PromptConfigCard({
  summaryPrompt,
  chatPrompt,
  onSummaryPromptChange,
  onChatPromptChange
}: PromptConfigCardProps) {
  return (
    <div className="border border-slate-200/80 rounded-2xl p-6 bg-slate-50/30 space-y-6">
      <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200/50 pb-3">
        <Terminal className="w-4 h-4 text-emerald-600" />
        <span>Konfigurasi System Prompt AI</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rangkuman Prompt */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            System Prompt Rangkuman (Summary)
          </label>
          <textarea
            rows={6}
            value={summaryPrompt}
            onChange={(e) => onSummaryPromptChange(e.target.value)}
            placeholder="Masukkan System Prompt Rangkuman..."
            className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary leading-relaxed shadow-inner"
          />
          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            Instruksi utama yang dikirim ke AI untuk memandu cara meringkas dokumen atau input teks.
          </p>
        </div>

        {/* Chat PDF Prompt */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            System Prompt Chat PDF
          </label>
          <textarea
            rows={6}
            value={chatPrompt}
            onChange={(e) => onChatPromptChange(e.target.value)}
            placeholder="Masukkan System Prompt Chat PDF..."
            className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary leading-relaxed shadow-inner"
          />
          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            Instruksi utama yang dikirim ke AI untuk menjawab pertanyaan berdasarkan konten PDF yang diunggah.
          </p>
        </div>
      </div>
    </div>
  );
}
