import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Download, File, FileText, Image as ImageIcon, Film, Music, 
  AlertTriangle, ShieldCheck, Calendar, HardDrive 
} from 'lucide-react';
import { fetchPublicFileInfo, getPublicDownloadUrl, getPublicPreviewUrl, SharedFileDto } from '../../api/shared';
import apiClient from '../../api/apiClient';

const getFileCategory = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
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
      return <ImageIcon className="w-16 h-16 text-blue-400" />;
    case 'pdf':
      return <FileText className="w-16 h-16 text-rose-500" />;
    case 'video':
      return <Film className="w-16 h-16 text-indigo-400" />;
    case 'audio':
      return <Music className="w-16 h-16 text-emerald-400" />;
    case 'text':
      return <FileText className="w-16 h-16 text-cyan-400" />;
    default:
      return <File className="w-16 h-16 text-slate-400" />;
  }
};

export default function PublicSharePage() {
  const { provider, shareToken } = useParams<{ provider: string; shareToken: string }>();
  const [fileInfo, setFileInfo] = useState<SharedFileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  useEffect(() => {
    if (!shareToken) return;

    const loadFileInfo = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        let data: SharedFileDto | null = null;
        
        if (provider) {
          data = await fetchPublicFileInfo(shareToken, provider);
        } else {
          // Legacy URL: coba local dulu, jika gagal coba google
          try {
            data = await fetchPublicFileInfo(shareToken, 'local');
          } catch (localErr) {
            console.warn('Gagal memuat berkas publik lokal, mencoba Google Drive...', localErr);
            data = await fetchPublicFileInfo(shareToken, 'google');
          }
        }
        setFileInfo(data);
      } catch (err: any) {
        console.error(err);
        setIsError(true);
        const msg = err.response?.data?.message || err.message || 'Tautan tidak ditemukan atau sudah kadaluarsa.';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileInfo();
  }, [shareToken, provider]);

  useEffect(() => {
    if (!fileInfo || !shareToken) {
      setObjectUrl(null);
      setPreviewError(null);
      setTextContent(null);
      return;
    }

    const category = getFileCategory(fileInfo.originalFileName);
    if (category === 'other') {
      return;
    }

    let activeUrl: string | null = null;
    const fetchBlob = async () => {
      try {
        setIsPreviewLoading(true);
        setPreviewError(null);
        setTextContent(null);
        
        const activeProvider = provider || (fileInfo.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'google' : 'local');
        const previewUrl = getPublicPreviewUrl(shareToken, activeProvider);
        
        const response = await apiClient.get(previewUrl, {
          responseType: 'blob',
        });
        
        const blob = response.data;
        if (category === 'text') {
          const text = await blob.text();
          setTextContent(text);
        } else {
          const url = URL.createObjectURL(blob);
          activeUrl = url;
          setObjectUrl(url);
        }
      } catch (err: any) {
        console.error('Failed to fetch public file for preview:', err);
        setPreviewError('Gagal memuat pratinjau berkas.');
      } finally {
        setIsPreviewLoading(false);
      }
    };

    fetchBlob();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [fileInfo, shareToken, provider]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-slate-400 mt-4 animate-pulse">Memuat detail berkas...</p>
      </div>
    );
  }

  if (isError || !fileInfo || !shareToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center text-white animate-fadeIn">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Tautan Kadaluarsa</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {errorMessage || 'Tautan pembagian berkas ini tidak valid atau telah habis masa aktifnya.'}
          </p>
          <div className="text-xs text-slate-500 border-t border-white/10 pt-4 font-semibold">
            Horizon Drive &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    );
  }

  const category = getFileCategory(fileInfo.originalFileName);
  const activeProvider = provider || (fileInfo?.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'google' : 'local');
  const downloadUrl = getPublicDownloadUrl(shareToken, activeProvider, true);

  return (
    <div className="min-h-screen h-screen w-screen bg-slate-950 flex flex-col text-white overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[300px] md:max-w-[450px]" title={fileInfo.originalFileName}>
              {fileInfo.originalFileName}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-0.5">
              <span>{formatFileSize(fileInfo.size)}</span>
              <span>•</span>
              <span className="truncate max-w-[100px] sm:max-w-none">{fileInfo.ownerEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline-flex bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Berbagi Publik
          </span>
          <a 
            href={downloadUrl}
            download={fileInfo.originalFileName}
            className="inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 text-xs py-2 px-4 gap-2 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh Berkas</span>
            <span className="sm:hidden">Unduh</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full bg-slate-950 flex items-center justify-center relative overflow-hidden p-4">
        {isPreviewLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-950/40 z-10">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-400 mt-4 animate-pulse">Memuat pratinjau media...</p>
          </div>
        )}

        {previewError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/40 z-10">
            <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h4 className="font-bold text-lg text-slate-200">Gagal Memuat Pratinjau</h4>
            <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">{previewError}</p>
          </div>
        )}

        {!isPreviewLoading && !previewError && (objectUrl || textContent !== null) && (
          <div className="w-full h-full flex items-center justify-center overflow-auto">
            {category === 'image' && objectUrl && (
              <img 
                src={objectUrl} 
                alt={fileInfo.originalFileName} 
                onError={() => setPreviewError('Browser gagal memuat gambar ini. Kemungkinan format tidak didukung.')}
                className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/10 transition-transform duration-300 hover:scale-[1.01]" 
              />
            )}

            {category === 'pdf' && objectUrl && (
              isMobile ? (
                <div className="w-full max-w-md p-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl text-center shadow-2xl mx-4">
                  <div className="mb-6 flex justify-center">
                    <FileText className="w-16 h-16 text-rose-500 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-white text-lg truncate mb-1" title={fileInfo.originalFileName}>
                    {fileInfo.originalFileName}
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">{formatFileSize(fileInfo.size)}</p>
                  <p className="text-xs text-slate-350 mb-6 font-semibold">Pratinjau PDF tidak didukung di browser seluler.</p>
                  <button 
                    onClick={() => window.open(objectUrl || '', '_blank')}
                    className="w-full inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 hover:shadow-lg active:scale-[0.98] bg-rose-650 hover:bg-rose-700 text-white text-sm py-3 px-6 gap-2.5"
                  >
                    Buka PDF di Tab Baru
                  </button>
                </div>
              ) : (
                <iframe 
                  src={objectUrl} 
                  title={fileInfo.originalFileName}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                />
              )
            )}

            {category === 'video' && objectUrl && (
              <video 
                src={objectUrl} 
                controls 
                onError={() => setPreviewError('Browser tidak dapat memutar video ini. Format/codec video ini kemungkinan tidak didukung oleh browser Anda.')}
                className="max-w-full max-h-[80vh] rounded-xl shadow-2xl border border-white/10 bg-black"
              />
            )}

            {category === 'audio' && objectUrl && (
              <div className="w-full max-w-md text-center p-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl shadow-2xl mx-4">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-inner animate-pulse">
                    <Music className="w-10 h-10 text-emerald-400" />
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg truncate mb-1" title={fileInfo.originalFileName}>
                  {fileInfo.originalFileName}
                </h3>
                <p className="text-xs text-slate-400 mb-6">{formatFileSize(fileInfo.size)}</p>
                <audio 
                  src={objectUrl} 
                  controls 
                  onError={() => setPreviewError('Browser tidak dapat memutar audio ini. Format audio tidak didukung.')}
                  className="w-full" 
                />
              </div>
            )}

            {category === 'text' && textContent !== null && (
              <div className="w-full max-w-4xl h-[80vh] p-6 backdrop-blur-md bg-slate-900 border border-white/10 rounded-3xl overflow-auto text-left font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-text text-slate-100">
                {textContent}
              </div>
            )}
          </div>
        )}

        {!isPreviewLoading && !previewError && !objectUrl && textContent === null && category !== 'other' && (
          <div className="text-center text-slate-400 space-y-2">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold">Menginisialisasi pratinjau...</p>
          </div>
        )}

        {!isPreviewLoading && !previewError && !objectUrl && textContent === null && category === 'other' && (
          <div className="w-full max-w-md p-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl text-center shadow-2xl mx-4">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              {getFileIcon(category)}
            </div>
            <h3 className="font-bold text-white text-lg truncate mb-1" title={fileInfo.originalFileName}>
              {fileInfo.originalFileName}
            </h3>
            <p className="text-xs text-slate-400 mb-6">{formatFileSize(fileInfo.size)}</p>
            
            <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5 space-y-3 mb-6">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Penyedia:</span>
                <span className="text-slate-200 uppercase tracking-wide">
                  {fileInfo.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Tanggal Unggah:</span>
                <span className="text-slate-200">
                  {new Date(fileInfo.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Pemilik Berkas:</span>
                <span className="text-slate-200 truncate max-w-[180px]">{fileInfo.ownerEmail}</span>
              </div>
            </div>

            <a 
              href={downloadUrl}
              download={fileInfo.originalFileName}
              className="w-full inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white text-sm py-3 px-6 gap-2.5"
            >
              <Download className="w-4 h-4" />
              Unduh Berkas
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
