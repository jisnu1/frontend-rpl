import React from 'react';
import { 
  FileText, 
  FileArchive, 
  FileSpreadsheet, 
  Video, 
  Image, 
  FileAudio,
  FileCode,
  File,
  FolderOpen
} from 'lucide-react';

interface FileIconProps {
  type: string;
  className?: string;
}

export default function FileIcon({ type, className = 'w-5 h-5' }: FileIconProps) {
  const normalizedType = type.toLowerCase().trim();

  const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; colorClass: string }> = {
    pdf: { icon: FileText, colorClass: 'bg-red-50 text-red-600 border border-red-150' },
    xlsx: { icon: FileSpreadsheet, colorClass: 'bg-emerald-50 text-emerald-600 border border-emerald-150' },
    xls: { icon: FileSpreadsheet, colorClass: 'bg-emerald-50 text-emerald-600 border border-emerald-150' },
    csv: { icon: FileSpreadsheet, colorClass: 'bg-emerald-50 text-emerald-600 border border-emerald-150' },
    docx: { icon: FileText, colorClass: 'bg-blue-50 text-blue-600 border border-blue-150' },
    doc: { icon: FileText, colorClass: 'bg-blue-50 text-blue-600 border border-blue-150' },
    zip: { icon: FileArchive, colorClass: 'bg-yellow-50 text-yellow-600 border border-yellow-150' },
    rar: { icon: FileArchive, colorClass: 'bg-yellow-50 text-yellow-600 border border-yellow-150' },
    '7z': { icon: FileArchive, colorClass: 'bg-yellow-50 text-yellow-600 border border-yellow-150' },
    tar: { icon: FileArchive, colorClass: 'bg-yellow-50 text-yellow-600 border border-yellow-150' },
    gz: { icon: FileArchive, colorClass: 'bg-yellow-50 text-yellow-600 border border-yellow-150' },
    mp4: { icon: Video, colorClass: 'bg-indigo-50 text-indigo-600 border border-indigo-150' },
    mkv: { icon: Video, colorClass: 'bg-indigo-50 text-indigo-600 border border-indigo-150' },
    avi: { icon: Video, colorClass: 'bg-indigo-50 text-indigo-600 border border-indigo-150' },
    png: { icon: Image, colorClass: 'bg-purple-50 text-purple-600 border border-purple-150' },
    jpg: { icon: Image, colorClass: 'bg-purple-50 text-purple-600 border border-purple-150' },
    jpeg: { icon: Image, colorClass: 'bg-purple-50 text-purple-600 border border-purple-150' },
    gif: { icon: Image, colorClass: 'bg-purple-50 text-purple-600 border border-purple-150' },
    svg: { icon: Image, colorClass: 'bg-purple-50 text-purple-600 border border-purple-150' },
    webp: { icon: Image, colorClass: 'bg-purple-50 text-purple-600 border border-purple-150' },
    mp3: { icon: FileAudio, colorClass: 'bg-pink-50 text-pink-600 border border-pink-150' },
    wav: { icon: FileAudio, colorClass: 'bg-pink-50 text-pink-600 border border-pink-150' },
    html: { icon: FileCode, colorClass: 'bg-orange-50 text-orange-600 border border-orange-150' },
    css: { icon: FileCode, colorClass: 'bg-teal-50 text-teal-600 border border-teal-150' },
    js: { icon: FileCode, colorClass: 'bg-yellow-50 text-yellow-600 border border-yellow-150' },
    ts: { icon: FileCode, colorClass: 'bg-blue-50 text-blue-600 border border-blue-150' },
    tsx: { icon: FileCode, colorClass: 'bg-blue-50 text-blue-600 border border-blue-150' },
    json: { icon: FileCode, colorClass: 'bg-slate-50 text-slate-600 border border-slate-150' },
    folder: { icon: FolderOpen, colorClass: 'bg-primary/10 text-primary border border-primary/20' }
  };

  const resolved = iconMap[normalizedType] || { icon: File, colorClass: 'bg-slate-100 text-slate-500 border border-slate-200' };
  const ResolvedIcon = resolved.icon;

  return (
    <div className={`p-2.5 rounded-full flex items-center justify-center shrink-0 ${resolved.colorClass}`}>
      <ResolvedIcon className={className} />
    </div>
  );
}
