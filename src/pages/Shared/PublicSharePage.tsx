import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, File, FileText, Image as ImageIcon, Film, Music, 
  AlertTriangle, ShieldCheck, Calendar, HardDrive, UploadCloud,
  Folder, Plus, Trash2, Grid, List, SearchX, Lock, ShieldAlert
} from 'lucide-react';
import { fetchPublicFileInfo, getPublicDownloadUrl, getPublicPreviewUrl, SharedFileDto } from '../../api/shared';
import { 
  fetchSharedFolderContentsPublic, 
  uploadToSharedFolderPublic, 
  deleteFromSharedFolderPublic 
} from '../../api/sharedFolders';
import { FolderResponse } from '../../api/folders';
import { FileResponse } from '../../api/files';
import FileIcon from '../../components/ui/FileIcon';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [shareType, setShareType] = useState<'FILE' | 'FOLDER' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // File Share states
  const [fileInfo, setFileInfo] = useState<SharedFileDto | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Folder Share states
  const [folderFolders, setFolderFolders] = useState<FolderResponse[]>([]);
  const [folderFiles, setFolderFiles] = useState<FileResponse[]>([]);
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [allowAnonymous, setAllowAnonymous] = useState(true);

  // Folder upload progress
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  const loadShareData = async () => {
    if (!shareToken) return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      // 1. Coba memuat sebagai folder share dulu
      const folderData = await fetchSharedFolderContentsPublic(shareToken);
      setFolderFolders(folderData.folders || []);
      setFolderFiles(folderData.files || []);
      setPermission(folderData.permission || 'VIEW');
      setAllowAnonymous(folderData.allowAnonymous !== undefined ? folderData.allowAnonymous : true);
      setShareType('FOLDER');
      setIsLoading(false);
    } catch (folderErr) {
      console.warn('Bukan folder share atau gagal memuat folder, mencoba file share...', folderErr);
      
      // 2. Jika gagal, coba memuat sebagai file share
      try {
        let data: SharedFileDto | null = null;
        if (provider) {
          data = await fetchPublicFileInfo(shareToken, provider);
        } else {
          try {
            data = await fetchPublicFileInfo(shareToken, 'local');
          } catch (localErr) {
            console.warn('Gagal memuat file publik lokal, mencoba GDrive...', localErr);
            data = await fetchPublicFileInfo(shareToken, 'google');
          }
        }
        setFileInfo(data);
        setShareType('FILE');
        setIsLoading(false);
      } catch (fileErr: any) {
        console.error(fileErr);
        setIsError(true);
        const msg = fileErr.response?.data?.message || fileErr.message || 'Tautan tidak ditemukan atau sudah kadaluarsa.';
        setErrorMessage(msg);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadShareData();
  }, [shareToken, provider]);

  // File preview effect (hanya untuk tipe FILE)
  useEffect(() => {
    if (shareType !== 'FILE' || !fileInfo || !shareToken) {
      setObjectUrl(null);
      setPreviewError(null);
      setTextContent(null);
      return;
    }

    const category = getFileCategory(fileInfo.originalFileName);
    if (category === 'other') return;

    let activeUrl: string | null = null;
    const fetchBlob = async () => {
      try {
        setIsPreviewLoading(true);
        setPreviewError(null);
        setTextContent(null);
        
        const activeProvider = provider || (fileInfo.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'google' : 'local');
        const previewUrl = getPublicPreviewUrl(shareToken, activeProvider);
        
        const response = await apiClient.get(previewUrl, { responseType: 'blob' });
        
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
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [fileInfo, shareType, shareToken, provider]);

  // Anonymous upload action
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!shareToken || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Check auth requirement
    if (!allowAnonymous && !isAuthenticated) {
      toastError('Unggahan anonim dinonaktifkan. Anda wajib login untuk mengunggah berkas.');
      return;
    }

    setUploadingFileName(file.name);
    setUploadProgress(0);

    try {
      await uploadToSharedFolderPublic(shareToken, file, (percent) => {
        setUploadProgress(percent);
      });
      toastSuccess(`Berkas "${file.name}" berhasil diunggah ke folder bersama.`);
      setUploadProgress(null);
      loadShareData(); // Reload folder contents
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Gagal mengunggah berkas.';
      toastError(msg);
      setUploadProgress(null);
    }
  };

  // Delete file action
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!shareToken) return;

    if (!allowAnonymous && !isAuthenticated) {
      toastError('Penghapusan anonim dinonaktifkan. Anda wajib login terlebih dahulu.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus berkas "${fileName}" dari folder bersama?`)) {
      return;
    }

    try {
      await deleteFromSharedFolderPublic(shareToken, fileId);
      toastSuccess(`Berkas "${fileName}" berhasil dihapus.`);
      loadShareData();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal menghapus berkas.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-slate-400 mt-4 animate-pulse">Memuat detail pembagian...</p>
      </div>
    );
  }

  if (isError || !shareToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center text-white animate-fadeIn">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Tautan Tidak Valid / Kadaluarsa</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {errorMessage || 'Tautan pembagian ini tidak valid, telah dihapus, atau telah habis masa aktifnya.'}
          </p>
          <div className="text-xs text-slate-500 border-t border-white/10 pt-4 font-semibold">
            Horizon Drive &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    );
  }

  // ───── RENDER 1: SHARED FOLDER COLLABORATION VIEW ─────
  if (shareType === 'FOLDER') {
    const isEditAllowed = permission === 'EDIT' && (allowAnonymous || isAuthenticated);
    const isLoginRequired = permission === 'EDIT' && !allowAnonymous && !isAuthenticated;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col text-white overflow-hidden">
        {/* Folder Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[400px]">
                Folder Bersama Publik
              </h1>
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-0.5">
                <span>{folderFolders.length} Folder</span>
                <span>•</span>
                <span>{folderFiles.length} Berkas</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
              permission === 'EDIT' 
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' 
                : 'bg-slate-500/20 border-slate-500/30 text-slate-300'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {permission === 'EDIT' ? 'Kolaboratif' : 'Hanya Baca'}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          
          {/* Lock message if login is required for editing */}
          {isLoginRequired && (
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-500/20 text-amber-300 rounded-2xl p-4 flex items-center gap-3 border border-amber-500/10">
              <Lock className="w-5 h-5 shrink-0" />
              <p className="text-xs font-semibold">
                Unggahan & penghapusan berkas dinonaktifkan secara anonim. Silakan masuk akun Anda untuk berkolaborasi di folder ini.
              </p>
            </div>
          )}

          {/* Upload Progress Bar if active */}
          {uploadProgress !== null && (
            <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 space-y-2 animate-pulse">
              <div className="flex justify-between items-center text-xs font-bold text-indigo-300">
                <span className="truncate max-w-[200px]">Mengunggah: {uploadingFileName}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* 1. Drag & Drop Upload Zone (only if editable) */}
          {isEditAllowed && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-white/5 rounded-3xl p-8 text-center cursor-pointer transition-all bg-white/2 flex flex-col items-center justify-center group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUploadFile} 
                className="hidden" 
              />
              <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-indigo-400 transition-colors mb-3" />
              <h3 className="text-sm font-bold text-slate-200">Unggah File ke Folder Bersama</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Seret file ke sini atau klik untuk memilih file dari perangkat Anda.
              </p>
            </div>
          )}

          {/* Content browser */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Isi Folder</h3>
            
            {folderFolders.length === 0 && folderFiles.length === 0 ? (
              <div className="py-16 text-center text-slate-500 font-bold bg-white/2 rounded-3xl border border-white/5">
                <SearchX className="w-12 h-12 block mx-auto mb-3 text-slate-650" />
                <h4 className="text-slate-350 text-sm">Folder ini kosong</h4>
                {isEditAllowed && <p className="text-xs text-slate-500 mt-1 font-semibold">Mulailah mengunggah file di atas.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                
                {/* Render subfolders */}
                {folderFolders.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/2 border border-white/5 select-none"
                  >
                    <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-200 truncate" title={sub.name}>
                      {sub.name}
                    </span>
                  </div>
                ))}

                {/* Render files */}
                {folderFiles.map((file) => {
                  const ext = file.originalFileName.split('.').pop() || '';
                  const downloadUrl = file.id 
                    ? getPublicDownloadUrl(shareToken, 'local', true) + `&fileId=${file.id}` 
                    : '#'; // Google drive file download is handled dynamically or locally
                  
                  return (
                    <Card 
                      key={file.id} 
                      className="p-5 flex flex-col gap-4 bg-white/2 border-white/5 hover:border-white/10 text-left cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <FileIcon type={ext} className="w-6 h-6 shrink-0" />
                        
                        {/* File actions */}
                        <div className="flex gap-1.5 shrink-0">
                          {file.id && (
                            <a
                              href={`${getPublicDownloadUrl(shareToken, 'local', true)}&fileId=${file.id}`}
                              download={file.originalFileName}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Unduh"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {isEditAllowed && file.id && (
                            <button
                              onClick={() => handleDeleteFile(file.id, file.originalFileName)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-200 truncate" title={file.originalFileName}>
                          {file.originalFileName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1 flex justify-between">
                          <span>{formatFileSize(file.size)}</span>
                          {file.createdAt && <span>{new Date(file.createdAt).toLocaleDateString()}</span>}
                        </p>
                      </div>
                    </Card>
                  );
                })}

              </div>
            )}

          </div>

        </div>

        <footer className="h-10 border-t border-white/5 bg-slate-900/40 text-center flex items-center justify-center text-[10px] text-slate-550 font-semibold shrink-0">
          Horizon Drive &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // ───── RENDER 2: SHARED FILE VIEW (LEGACY) ─────
  if (!fileInfo) return null;
  const category = getFileCategory(fileInfo.originalFileName);
  const activeProvider = provider || (fileInfo.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'google' : 'local');
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
            <p className="text-sm text-slate-450 mt-2 max-w-sm leading-relaxed">{previewError}</p>
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
