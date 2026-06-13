import React from 'react';
import { Terminal } from 'lucide-react';

interface PromptAccordionProps {
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PromptAccordion({
  value,
  onChange,
  isOpen,
  onToggle
}: PromptAccordionProps) {
  return (
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/30">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-slate-100/40 text-slate-800 font-bold hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-bold">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <span>System Prompt Utama (Bahasa Indonesia)</span>
        </div>
        <span className="text-xs font-bold text-slate-400">
          {isOpen ? 'Sembunyikan' : 'Tampilkan'}
        </span>
      </button>
      
      {isOpen && (
        <div className="p-5 border-t border-slate-200/80 space-y-2 bg-white">
          <textarea
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Masukkan System Prompt Utama..."
            className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-medium bg-slate-50/20 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
