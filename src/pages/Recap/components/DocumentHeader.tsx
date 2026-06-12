import React from 'react';
import { FileText, Download } from 'lucide-react';
import { useActivity } from '../../../context/ActivityContext';

interface DocumentHeaderProps {
  fileDetails: {
    id: string;
    originalFileName: string;
    size: number;
    createdAt: string;
    provider: string;
  } | null;
}

export default function DocumentHeader({ fileDetails }: DocumentHeaderProps) {
  const { downloadFile } = useActivity();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileName = fileDetails?.originalFileName || 'Loading Document...';
  const fileSize = fileDetails ? formatSize(fileDetails.size) : '...';
  const fileDate = fileDetails ? new Date(fileDetails.createdAt).toLocaleDateString() : '...';

  return (
    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* File Info */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800">{fileName}</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-semibold">
            Uploaded {fileDate} • {fileSize}
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        {fileDetails && (
          <button
            onClick={() => downloadFile(fileDetails.id, fileDetails.originalFileName, fileDetails.provider, fileDetails.size)}
            className="flex items-center justify-center p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-55 transition-colors shadow-sm"
            title="Download Document"
          >
            <Download className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}
