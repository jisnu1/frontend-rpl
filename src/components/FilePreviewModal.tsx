import React, { useState, useEffect } from 'react';
import {
  X, Download, HardDrive, FileText, Image as ImageIcon,
  Film, Music, Calendar, ShieldCheck, AlertTriangle
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { getPreviewUrl } from '../api/files';
import { useActivity } from '../context/ActivityContext';
import { getPublicPreviewUrl, getPublicDownloadUrl } from '../api/shared';

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

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileId,
  fileName,
  provider,
  fileSize,
  ownerEmail,
  createdAt,
  shareToken,
  externalAccountId
}: FilePreviewModalProps) {
  const { downloadFile } = useActivity();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  useEffect(() => {
    if (!isOpen || !fileId || !provider) {
      setObjectUrl(null);
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
        const cat = getFileCategory(fileName || 'Berkas');
        if (cat === 'text') {
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
  }, [isOpen, fileId, provider, fileName]);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileCategory = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) return 'audio';
    if (['txt', 'log', 'md', 'json', 'xml', 'js', 'css', 'html', 'java', 'py', 'sh', 'ts', 'tsx', 'jsx'].includes(ext)) return 'text';
    return 'other';
  };

  const getFileIcon = (category: string) => {
    switch (category) {
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
      default:
        return <FileText className="w-16 h-16 text-slate-500/80" />;
    }
  };

  const category = getFileCategory(name);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm transition-all duration-300 p-4">
      {/* Background overlay click handler */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Glassmorphic main modal container */}
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row shadow-[0px_20px_50px_rgba(15,23,42,0.3)] border border-slate-100 z-10 animate-fadeIn max-h-[90vh]">

        {/* Left Side: Preview Area */}
        <div className="md:w-3/5 bg-slate-950/95 flex items-center justify-center p-4 md:p-6 border-b border-slate-800 md:border-b-0 md:border-r border-slate-800 relative min-h-[220px] max-h-[45vh] md:max-h-none md:min-h-[480px]">

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

          {!isLoading && !error && (objectUrl || textContent !== null) && (
            <div className="w-full h-full flex items-center justify-center">
              {category === 'image' && objectUrl && (
                <img
                  src={objectUrl}
                  alt={name}
                  onError={() => setError('Browser gagal memuat gambar ini. Kemungkinan format tidak didukung.')}
                  className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-lg border border-white/5 transition-transform duration-300 hover:scale-[1.01]"
                />
              )}

              {category === 'pdf' && objectUrl && (
                isMobile ? (
                  <div className="w-full max-w-sm text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="mb-4 flex justify-center">
                      <FileText className="w-12 h-12 text-rose-400 animate-pulse" />
                    </div>
                    <p className="text-xs font-semibold text-slate-300 mb-4">Pratinjau PDF tidak didukung di browser seluler.</p>
                    <button
                      onClick={() => window.open(objectUrl || '', '_blank')}
                      className="w-full inline-flex items-center justify-center font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs py-2.5 px-4 gap-2"
                    >
                      Buka PDF di Tab Baru
                    </button>
                  </div>
                ) : (
                  <iframe
                    src={objectUrl}
                    title={name}
                    className="w-full h-[350px] md:h-[430px] rounded-xl border border-white/10 bg-white"
                  />
                )
              )}

              {category === 'video' && objectUrl && (
                <video
                  src={objectUrl}
                  controls
                  onError={() => setError('Browser tidak dapat memutar video ini. Format/codec video ini kemungkinan tidak didukung oleh browser Anda.')}
                  className="w-full max-h-[70vh] rounded-xl shadow-lg border border-white/5 bg-black"
                />
              )}

              {category === 'audio' && objectUrl && (
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

              {category === 'text' && textContent !== null && (
                <div className="w-full h-[320px] md:h-[430px] bg-slate-900 text-slate-100 p-4 rounded-xl border border-white/10 overflow-auto font-mono text-[11px] text-left whitespace-pre-wrap leading-relaxed select-text">
                  {textContent}
                </div>
              )}

              {category === 'other' && (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    {getFileIcon(category)}
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Pratinjau tidak tersedia untuk jenis berkas ini.</p>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && !objectUrl && textContent === null && (
            <div className="text-center text-slate-400 space-y-2">
              {getFileIcon(category)}
              <p className="text-xs font-semibold">Menginisialisasi pratinjau...</p>
            </div>
          )}
        </div>

        {/* Right Side: File Info & Download Section */}
        <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between bg-white text-slate-800 overflow-y-auto max-h-[45vh] md:max-h-none shrink-0">
          <div className="space-y-6">

            {/* Header / Title */}
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold tracking-tight text-slate-850 line-clamp-3 leading-snug" title={name}>
                  {name}
                </h2>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Privat & Aman
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-650 transition-colors p-1.5 rounded-full hover:bg-slate-50 border border-slate-100 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-4 pt-4 border-t border-slate-100">

              {/* Size */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-150/80 shrink-0">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ukuran Berkas</div>
                  <div className="text-xs font-bold text-slate-700">{formatFileSize(size)}</div>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-150/80 shrink-0">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Penyedia Penyimpanan</div>
                  <span className={`inline-flex mt-0.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${pvd.toUpperCase() === 'GOOGLE_DRIVE'
                      ? 'bg-amber-50 border-amber-100 text-amber-600'
                      : 'bg-blue-50 border-blue-100 text-blue-600'
                    }`}>
                    {pvd.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage'}
                  </span>
                </div>
              </div>

              {/* Uploaded At */}
              {createdAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-150/80 shrink-0">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Diunggah</div>
                    <div className="text-xs font-bold text-slate-700">
                      {new Date(createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Owner Email */}
              {ownerEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-150/80 shrink-0">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pemilik Berkas</div>
                    <div className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={ownerEmail}>
                      {ownerEmail}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col gap-2">
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
              className="w-full inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-[0.98] bg-primary text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-primary/20 text-xs py-3 px-6 gap-2"
            >
              <Download className="w-4 h-4" />
              Unduh Berkas
            </button>
            <button
              onClick={onClose}
              className="w-full inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-[0.98] bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs py-2 px-6"
            >
              Tutup
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
