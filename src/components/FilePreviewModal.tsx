import React, { useState, useEffect } from 'react';
import {
  X, Download, FileText, Image as ImageIcon,
  Film, Music, AlertTriangle
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { getPreviewUrl } from '../api/files';
import { useActivity } from '../context/ActivityContext';
import { getPublicPreviewUrl, getPublicDownloadUrl } from '../api/shared';
import { getFileCategory, getFileExtension } from '../utils/fileHelpers';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | null | undefined;
  fileName: string | null | undefined;
  provider: string | null | undefined;
  fileSize: number | null | undefined;
  ownerEmail?: string | null | undefined;
  createdAt?: string | null | undefined;
  shareToken?: string;
  externalAccountId?: number | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function tokenizeAndHighlight(code: string, ext: string): string {
  const escaped = escapeHtml(code);
  
  if (['txt', 'log'].includes(ext)) {
    return escaped;
  }
  
  const regex = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/)|' + // Group 1: Multi-line comments
    '(\\/\\/.*|#.*)|' +            // Group 2: Single-line comments
    '("(?:\\\\[\\s\\S]|[^"\\\\])*")|' + // Group 3: Double quoted string
    '(\'(?:\\\\[\\s\\S]|[^\'\\\\])*\')|' + // Group 4: Single quoted string
    '(`(?:\\\\[\\s\\S]|[^`\\\\])*`)|' + // Group 5: Template literals
    '(@\\w+)|' +                   // Group 6: Decorators/Annotations
    '\\b(class|interface|enum|extends|implements|package|import|public|private|protected|static|final|native|transient|volatile|synchronized|throws|return|def|const|let|var|function|if|else|for|while|do|switch|case|break|continue|default|try|catch|finally|throw|new|this|super|type|from|export|as|void|int|double|float|long|short|byte|boolean|char|string|number|any|unknown|null|undefined|true|false|self|lambda|assert|async|await|yield|elif|in|is|not|and|or|pass|except|raise|with|struct|union|register|extern|typedef|inline|virtual|override|sql|select|insert|update|delete|from|where|join|left|right|inner|outer|on|group|by|order|having|limit|create|table|alter|drop|index|view|into|values|set)\\b|' + // Group 7: Keywords
    '\\b(\\d+(?:\\.\\d+)?)\\b|' +   // Group 8: Numbers
    '(\\b\\w+)(?=\\()',            // Group 9: Functions
    'g'
  );
  
  let lastIndex = 0;
  let html = '';
  
  escaped.replace(regex, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, offset) => {
    if (offset > lastIndex) {
      html += escaped.substring(lastIndex, offset);
    }
    
    if (p1 || p2) {
      html += `<span class="text-slate-500 italic">${match}</span>`;
    } else if (p3 || p4 || p5) {
      html += `<span class="text-amber-300 font-medium">${match}</span>`;
    } else if (p6) {
      html += `<span class="text-indigo-400 font-bold">${match}</span>`;
    } else if (p7) {
      html += `<span class="text-pink-400 font-bold">${match}</span>`;
    } else if (p8) {
      html += `<span class="text-orange-400">${match}</span>`;
    } else if (p9) {
      html += `<span class="text-sky-300 font-medium">${match}</span>`;
    } else {
      html += match;
    }
    
    lastIndex = offset + match.length;
    return match;
  });
  
  if (lastIndex < escaped.length) {
    html += escaped.substring(lastIndex);
  }
  
  return html;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileId,
  fileName,
  provider,
  fileSize,
  shareToken,
  externalAccountId
}: FilePreviewModalProps) {
  const { downloadFile } = useActivity();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !fileId || !provider) {
      setObjectUrl(null);
      setError(null);
      setTextContent(null);
      return;
    }

    const nameStr = fileName || 'Berkas';
    const ext = getFileExtension(nameStr);
    const isGoogleDrive = provider.toUpperCase() === 'GOOGLE_DRIVE';
    const isOffice = ['xls', 'xlsx', 'ods', 'doc', 'docx', 'ppt', 'pptx', 'odp'].includes(ext);

    // Skip fetching blob for Google Drive files or Office files (rendered via iframe or card)
    if (isGoogleDrive || isOffice) {
      setIsLoading(false);
      setError(null);
      setTextContent(null);
      return;
    }

    let activeUrl: string | null = null;
    const fetchBlob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setTextContent(null);
        
        const previewUrl = shareToken
          ? getPublicPreviewUrl(shareToken, provider, fileId)
          : getPreviewUrl(fileId, provider, externalAccountId);
        const response = await apiClient.get(previewUrl, {
          responseType: 'blob',
        });
        
        const blob = response.data;
        const cat = getFileCategory(nameStr);
        if (cat === 'text' || (cat === 'spreadsheet' && ext === 'csv')) {
          const text = await blob.text();
          setTextContent(text);
        } else {
          const url = URL.createObjectURL(blob);
          activeUrl = url;
          setObjectUrl(url);
        }
      } catch (err: any) {
        console.error('Failed to fetch file for preview:', err);
        const errMsg = err.response?.data?.message || err.message || 'Gagal memuat pratinjau berkas.';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlob();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [isOpen, fileId, provider, fileName, shareToken, externalAccountId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const name = fileName || 'Berkas';
  const size = fileSize || 0;
  const pvd = provider || 'local';
  const ext = getFileExtension(name);
  const isGoogleDrive = pvd.toUpperCase() === 'GOOGLE_DRIVE';
  const isOffice = ['xls', 'xlsx', 'ods', 'doc', 'docx', 'ppt', 'pptx', 'odp'].includes(ext);
  const isCsv = ext === 'csv';
  const category = getFileCategory(name);

  const getFileIcon = (cat: string) => {
    switch (cat) {
      case 'image':
        return <ImageIcon className="w-16 h-16 text-blue-500/80" />;
      case 'pdf':
        return <FileText className="w-16 h-16 text-rose-500/80" />;
      case 'video':
        return <Film className="w-16 h-16 text-indigo-500/80" />;
      case 'audio':
        return <Music className="w-16 h-16 text-emerald-500/80" />;
      case 'text':
        return <FileText className="w-16 h-16 text-cyan-500/80" />;
      case 'spreadsheet':
        return <FileText className="w-16 h-16 text-emerald-500/80" />;
      case 'document':
        return <FileText className="w-16 h-16 text-blue-600/80" />;
      case 'presentation':
        return <FileText className="w-16 h-16 text-orange-500/80" />;
      default:
        return <FileText className="w-16 h-16 text-slate-500/80" />;
    }
  };

  const renderCsvTable = (csvText: string) => {
    const parseCSV = (text: string) => {
      const lines = text.split(/\r?\n/);
      return lines
        .map(line => {
          const row: string[] = [];
          let insideQuote = false;
          let currentCell = '';
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
              row.push(currentCell.replace(/^"|"$/g, '').trim());
              currentCell = '';
            } else {
              currentCell += char;
            }
          }
          row.push(currentCell.replace(/^"|"$/g, '').trim());
          return row;
        })
        .filter(row => row.length > 0 && row.some(cell => cell !== ''));
    };

    const csvRows = parseCSV(csvText);
    if (csvRows.length === 0) {
      return <div className="text-slate-400 text-xs py-8 text-center font-bold">Berkas CSV kosong.</div>;
    }

    return (
      <div className="w-full h-full overflow-auto bg-slate-900 border border-slate-800 rounded-xl p-4 text-left select-text scrollbar-thin">
        <table className="w-full text-left border-collapse text-[10px] font-mono">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700 text-slate-300">
              {csvRows[0].map((cell, idx) => (
                <th key={idx} className="p-2 font-bold border border-slate-700 bg-slate-800/90 sticky top-0">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-350">
            {csvRows.slice(1).map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-800/40">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="p-2 border border-slate-700 max-w-[150px] truncate" title={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCodePreview = (codeText: string, fileExt: string) => {
    const highlighted = tokenizeAndHighlight(codeText, fileExt);
    const lines = highlighted.split(/\r?\n/);
    return (
      <div className="w-full h-full bg-[#1e1e1e] rounded-xl border border-white/10 overflow-auto font-mono text-xs text-left select-text scrollbar-thin">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="hover:bg-white/5 leading-relaxed group">
                <td className="w-10 text-right pr-4 text-slate-650 select-none border-r border-slate-800 align-top pt-0.5 font-semibold">
                  {index + 1}
                </td>
                <td className="pl-4 whitespace-pre select-text align-top pt-0.5 text-slate-300" dangerouslySetInnerHTML={{ __html: line || ' ' }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm transition-all duration-300 p-4">
      {/* Background overlay click handler */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Glassmorphic main modal container */}
      <div className="relative bg-white rounded-3xl overflow-hidden w-full max-w-5xl h-[85vh] flex flex-col shadow-[0px_20px_50px_rgba(15,23,42,0.3)] border border-slate-100 z-10 animate-fadeIn">
        
        {/* Header: Name (left) & Actions (right) */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-base font-bold text-slate-800 truncate" title={name}>
              {name}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (fileId && provider) {
                  if (shareToken) {
                    const downloadUrl = getPublicDownloadUrl(shareToken, provider, true, fileId);
                    window.open(downloadUrl, '_blank');
                  } else {
                    downloadFile(fileId, name, provider, size, externalAccountId);
                  }
                }
              }}
              className="inline-flex items-center justify-center font-bold rounded-xl bg-primary hover:bg-indigo-700 text-white text-xs py-2 px-4 gap-2 cursor-pointer transition-all duration-200"
              title="Unduh Berkas"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh</span>
            </button>
            
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-650 transition-colors p-2 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area: 100% remaining space */}
        <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-hidden flex items-center justify-center relative w-full h-full">

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-950/95 z-20">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-400 mt-4 animate-pulse">Memuat pratinjau media...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/95 z-20">
              <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">Gagal Memuat Pratinjau</h4>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              {/* Case 1: Google Drive File (Universal Viewer) */}
              {isGoogleDrive && (
                <iframe
                  src={`https://drive.google.com/file/d/${fileId}/preview`}
                  title={name}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                  allow="autoplay"
                />
              )}

              {/* Case 2: Public Office File (Excel, Word, PowerPoint via MS Office Viewer) */}
              {!isGoogleDrive && isOffice && shareToken && (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    getPublicPreviewUrl(shareToken, pvd, fileId || undefined)
                  )}`}
                  title={name}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                />
              )}

              {/* Case 3: Private Office File (Show Premium Info Card) */}
              {!isGoogleDrive && isOffice && !shareToken && (
                <div className="text-center p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl max-w-sm space-y-4">
                  <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Pratinjau Office Terbatas</h4>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Dokumen Microsoft Office ({ext.toUpperCase()}) yang bersifat privat tidak dapat di-preview secara online demi keamanan data.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (fileId && provider) {
                          downloadFile(fileId, name, provider, size, externalAccountId);
                        }
                      }}
                      className="w-full inline-flex items-center justify-center font-bold rounded-xl bg-primary text-white text-xs py-2.5 px-4 gap-2 cursor-pointer transition-all active:scale-[0.97]"
                    >
                      <Download className="w-4 h-4" />
                      Unduh Berkas untuk Membaca
                    </button>
                  </div>
                </div>
              )}

              {/* Case 4: CSV File */}
              {!isGoogleDrive && isCsv && textContent !== null && (
                renderCsvTable(textContent)
              )}

              {/* Case 5: Standard Image Preview */}
              {!isGoogleDrive && !isOffice && !isCsv && category === 'image' && objectUrl && (
                <img
                  src={objectUrl}
                  alt={name}
                  onError={() => setError('Browser gagal memuat gambar ini. Kemungkinan format tidak didukung.')}
                  className="max-w-full max-h-full rounded-xl object-contain shadow-lg border border-white/5 transition-transform duration-300 hover:scale-[1.01]"
                />
              )}

              {/* Case 6: Standard PDF Preview */}
              {!isGoogleDrive && !isOffice && !isCsv && category === 'pdf' && objectUrl && (
                <iframe
                  src={objectUrl}
                  title={name}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                />
              )}

              {/* Case 7: Video Preview */}
              {!isGoogleDrive && !isOffice && !isCsv && category === 'video' && objectUrl && (
                <video
                  src={objectUrl}
                  controls
                  onError={() => setError('Browser tidak dapat memutar video ini. Format/codec video ini kemungkinan tidak didukung oleh browser Anda.')}
                  className="w-full max-h-full rounded-xl shadow-lg border border-white/5 bg-black"
                />
              )}

              {/* Case 8: Audio Preview */}
              {!isGoogleDrive && !isOffice && !isCsv && category === 'audio' && objectUrl && (
                <div className="w-full max-w-md text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="mb-4 flex justify-center">
                    <Music className="w-14 h-14 text-emerald-400 animate-pulse" />
                  </div>
                  <audio
                    src={objectUrl}
                    controls
                    onError={() => setError('Browser tidak dapat memutar audio ini. Format audio tidak didukung.')}
                    className="w-full"
                  />
                </div>
              )}

              {/* Case 9: Plain Text & Code Preview with syntax highlighting */}
              {!isGoogleDrive && !isOffice && !isCsv && category === 'text' && textContent !== null && (
                renderCodePreview(textContent, ext)
              )}

              {/* Case 10: Other (Unsupported type) */}
              {!isGoogleDrive && !isOffice && !isCsv && category === 'other' && (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    {getFileIcon(category)}
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Pratinjau tidak tersedia untuk jenis berkas ini.</p>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && !objectUrl && textContent === null && !isGoogleDrive && !isOffice && (
            <div className="text-center text-slate-400 space-y-2">
              {getFileIcon(category)}
              <p className="text-xs font-semibold">Menginisialisasi pratinjau...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
