import React from 'react';
import { BookOpen } from 'lucide-react';
import MarkdownRenderer from '../../../components/ui/MarkdownRenderer';

interface AiRecapTabProps {
  summary: string;
  isLoading: boolean;
}

export default function AiRecapTab({ summary, isLoading }: AiRecapTabProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      {/* Quick Summary Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          Executive Summary
        </h3>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="flex items-center gap-2 h-[48px]">
              <div className="ai-wave-bar-large"></div>
              <div className="ai-wave-bar-large"></div>
              <div className="ai-wave-bar-large"></div>
              <div className="ai-wave-bar-large"></div>
              <div className="ai-wave-bar-large"></div>
            </div>
            <span className="text-xs font-bold text-slate-400 select-none animate-pulse">
              AI is summarizing the document...
            </span>
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 text-xs font-medium leading-relaxed text-slate-650">
            {summary ? (
              <MarkdownRenderer text={summary} />
            ) : (
              'Ringkasan dokumen tidak tersedia atau kosong.'
            )}
          </div>
        )}
      </section>
    </div>
  );
}
