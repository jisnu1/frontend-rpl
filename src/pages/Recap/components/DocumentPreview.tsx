import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface DocumentPreviewProps {
  fileDetails: {
    originalFileName: string;
    size: number;
    provider: string;
  } | null;
  summary: string;
  isLoading: boolean;
}

export default function DocumentPreview({ fileDetails, summary, isLoading }: DocumentPreviewProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileName = fileDetails?.originalFileName || 'Memuat Dokumen...';
  const fileSize = fileDetails ? formatSize(fileDetails.size) : '...';
  const providerName = fileDetails?.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage';

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50 flex flex-col justify-center items-center">
      <div className="w-full max-w-[650px] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-150/85 rounded-2xl space-y-6 relative">
        {/* Document Info Card */}
        <div className="flex items-center gap-4 border-b pb-6 border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-slate-800 truncate">{fileName}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">
              {providerName} • {fileSize}
            </p>
          </div>
        </div>

        {/* Real Summary Content */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            AI Document Overview
          </h3>
          
          {isLoading ? (
            <div className="space-y-3 py-2">
              <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-4/5 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
            </div>
          ) : (
            <div className="text-xs font-semibold leading-relaxed text-slate-650 bg-slate-50/50 rounded-xl p-4 border border-slate-100 whitespace-pre-line">
              {summary || 'Ringkasan dokumen tidak tersedia atau kosong.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
