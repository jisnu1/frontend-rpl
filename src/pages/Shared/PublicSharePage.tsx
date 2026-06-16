import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, File, FileText, Image as ImageIcon, Film, Music, 
  AlertTriangle, ShieldCheck, Calendar, HardDrive, UploadCloud,
  Folder, Plus, Trash2, SearchX, Lock, ShieldAlert, ArrowLeft, ArrowRight, Home
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
      return <ImageIcon className="w-16 h-16 text-[#fab795]" />;
    case 'pdf':
      return <FileText className="w-16 h-16 text-[#e95678]" />;
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
  const activeShareToken = shareToken || '';
  const activeProviderParam = provider || '';
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

  // Subfolder navigation history
  const [navigationHistory, setNavigationHistory] = useState<{ id: string; name: string }[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('');

  // Folder upload progress
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fullscreen Drag and Drop states
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  const loadShareData = async (folderId?: string) => {
    if (!activeShareToken) return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      // 1. Coba memuat sebagai folder share dulu
      const folderData = await fetchSharedFolderContentsPublic(activeShareToken, folderId);
      setFolderFolders(folderData.folders || []);
      setFolderFiles(folderData.files || []);
      setPermission(folderData.permission || 'VIEW');
      setAllowAnonymous(folderData.allowAnonymous !== undefined ? folderData.allowAnonymous : true);
      setShareType('FOLDER');
      setIsLoading(false);
    } catch (folderErr: any) {
      console.warn('Bukan folder share atau gagal memuat folder, mencoba file share...', folderErr);
      
      // Jika error 400/403 (Misal kadaluarsa atau dilarang akses), tangkap langsung dan tampilkan error
      if (folderErr.response?.status === 400 || folderErr.response?.status === 403) {
        setIsError(true);
        const msg = folderErr.response?.data?.message || 'Tautan berbagi folder telah kedaluwarsa atau akses ditolak.';
        setErrorMessage(msg);
        setIsLoading(false);
        return;
      }

      // 2. Jika gagal karena alasan lain, coba memuat sebagai file share
      try {
        let data: SharedFileDto | null = null;
        if (activeProviderParam) {
          data = await fetchPublicFileInfo(activeShareToken, activeProviderParam);
        } else {
          try {
            data = await fetchPublicFileInfo(activeShareToken, 'local');
          } catch (localErr) {
            console.warn('Gagal memuat file publik lokal, mencoba GDrive...', localErr);
            data = await fetchPublicFileInfo(activeShareToken, 'google');
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
    // Reset navigasi saat share token berganti
    setNavigationHistory([]);
    setCurrentFolderId('');
    loadShareData();
  }, [shareToken, provider]);

  // File preview effect (hanya untuk tipe FILE)
  useEffect(() => {
    if (shareType !== 'FILE' || !fileInfo || !activeShareToken) {
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
        const previewUrl = getPublicPreviewUrl(activeShareToken, activeProvider);
        
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
    if (!activeShareToken || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Check auth requirement
    if (!allowAnonymous && !isAuthenticated) {
      toastError('Unggahan anonim dinonaktifkan. Anda wajib login untuk mengunggah berkas.');
      return;
    }

    setUploadingFileName(file.name);
    setUploadProgress(0);

    try {
      await uploadToSharedFolderPublic(activeShareToken, file, currentFolderId, (percent) => {
        setUploadProgress(percent);
      });
      toastSuccess(`Berkas "${file.name}" berhasil diunggah ke folder bersama.`);
      setUploadProgress(null);
      loadShareData(currentFolderId); // Reload folder contents
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Gagal mengunggah berkas.';
      toastError(msg);
      setUploadProgress(null);
    }
  };

  // Delete file action
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!activeShareToken) return;

    if (!allowAnonymous && !isAuthenticated) {
      toastError('Penghapusan anonim dinonaktifkan. Anda wajib login terlebih dahulu.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus berkas "${fileName}" dari folder bersama?`)) {
      return;
    }

    try {
      await deleteFromSharedFolderPublic(activeShareToken, fileId);
      toastSuccess(`Berkas "${fileName}" berhasil dihapus.`);
      loadShareData(currentFolderId);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal menghapus berkas.');
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const isEditAllowed = permission === 'EDIT' && (allowAnonymous || isAuthenticated);
    if (!isEditAllowed) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadingFileName(file.name);
      setUploadProgress(0);

      try {
        await uploadToSharedFolderPublic(activeShareToken, file, currentFolderId, (percent) => {
          setUploadProgress(percent);
        });
        toastSuccess(`Berkas "${file.name}" berhasil diunggah ke folder bersama.`);
        setUploadProgress(null);
        loadShareData(currentFolderId);
      } catch (err: any) {
        console.error(err);
        toastError(err.response?.data?.message || 'Gagal mengunggah berkas.');
        setUploadProgress(null);
      }
    }
  };

  // Subfolder navigations
  const handleFolderClick = (subfolder: FolderResponse) => {
    const nextHistory = [...navigationHistory, { id: subfolder.id, name: subfolder.name }];
    setNavigationHistory(nextHistory);
    setCurrentFolderId(subfolder.id);
    loadShareData(subfolder.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setNavigationHistory([]);
      setCurrentFolderId('');
      loadShareData('');
    } else {
      const nextHistory = navigationHistory.slice(0, index + 1);
      const target = nextHistory[index];
      setNavigationHistory(nextHistory);
      setCurrentFolderId(target.id);
      loadShareData(target.id);
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
      <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#e95678]/20 border-t-[#e95678] rounded-full animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-slate-400 mt-4 animate-pulse uppercase tracking-wider">Memuat detail pembagian...</p>
      </div>
    );
  }

  if (isError || !activeShareToken) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-[#1c1e26]/80 border border-white/5 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center text-white animate-fadeIn">
          <div className="w-16 h-16 bg-[#e95678]/10 border border-[#e95678]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-[#e95678]" />
          </div>
          <h2 className="text-xl font-bold mb-2">Tautan Tidak Valid / Kadaluarsa</h2>
          <p className="text-xs text-slate-450 mb-6 leading-relaxed">
            {errorMessage || 'Tautan pembagian ini tidak valid, telah dihapus, atau telah habis masa aktifnya.'}
          </p>
          <div className="text-[10px] text-slate-500 border-t border-white/5 pt-4 font-semibold uppercase tracking-wider">
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
      <div 
        className="min-h-screen bg-[#0f111a] flex flex-col text-white overflow-hidden relative"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
      >
        {/* Fullscreen Drag and Drop Overlay */}
        {isDragging && isEditAllowed && (
          <div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f111a]/90 backdrop-blur-md border-4 border-dashed border-[#e95678] animate-fadeIn"
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadCloud className="w-20 h-20 text-[#e95678] animate-bounce mb-4" />
            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wide">Lepaskan Berkas untuk Mengunggah</h3>
            <p className="text-xs text-slate-450 mt-1">Unggah langsung ke folder saat ini</p>
          </div>
        )}

        {/* Top Header / Navbar */}
        <header className="h-16 bg-[#1c1e26]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[#e95678] to-[#fab795] rounded-xl flex items-center justify-center shadow-lg shadow-[#e95678]/20 shrink-0">
              <Folder className="w-5 h-5 text-[#0f111a]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[350px]">
                {navigationHistory.length > 0 ? navigationHistory[navigationHistory.length - 1].name : 'Folder Bersama Publik'}
              </h1>
              <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5 uppercase tracking-wide">
                <span>{folderFolders.length} Folder</span>
                <span>•</span>
                <span>{folderFiles.length} Berkas</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
              permission === 'EDIT' 
                ? 'bg-[#e95678]/10 border-[#e95678]/20 text-[#e95678]' 
                : 'bg-slate-500/10 border-slate-500/20 text-slate-350'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {permission === 'EDIT' ? 'Kolaboratif' : 'Hanya Baca'}
            </span>

            {isEditAllowed && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-[#e95678] to-[#fab795] text-[#0f111a] font-bold text-xs px-4 py-2 rounded-full shadow-lg shadow-[#e95678]/20 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Unggah Berkas</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleUploadFile} 
                  className="hidden" 
                />
              </>
            )}
          </div>
        </header>

        {/* Content Browser Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          
          {/* Lock message if login is required for editing */}
          {isLoginRequired && (
            <div className="bg-[#fab795]/5 border border-[#fab795]/10 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn text-[#fab795]">
              <Lock className="w-5 h-5 shrink-0" />
              <p className="text-xs font-semibold">
                Unggahan & penghapusan berkas dinonaktifkan secara anonim. Silakan masuk akun Anda untuk berkolaborasi di folder ini.
              </p>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploadProgress !== null && (
            <div className="bg-[#1c1e26] border border-white/5 rounded-2xl p-4 space-y-2 animate-pulse">
              <div className="flex justify-between items-center text-xs font-bold text-[#e95678]">
                <span className="truncate max-w-[220px]">Mengunggah: {uploadingFileName}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#0f111a] rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-[#e95678] to-[#fab795] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Dynamic Interactive Breadcrumbs */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-slate-400 bg-[#1c1e26]/40 px-4 py-3 border border-white/5 rounded-2xl">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="flex items-center gap-1.5 text-slate-350 hover:text-[#e95678] transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Root</span>
            </button>
            {navigationHistory.map((item, idx) => (
              <React.Fragment key={item.id}>
                <span className="text-slate-600">/</span>
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`hover:text-[#e95678] transition-all cursor-pointer ${idx === navigationHistory.length - 1 ? 'text-[#fab795]' : 'text-slate-350'}`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Folders & Files Container */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Isi Direktori</h3>
            
            {folderFolders.length === 0 && folderFiles.length === 0 ? (
              <div className="py-24 text-center bg-[#1c1e26]/30 rounded-3xl border border-white/5">
                <SearchX className="w-16 h-16 block mx-auto mb-4 text-slate-650" />
                <h4 className="text-slate-300 text-sm font-bold">Direktori ini kosong</h4>
                {isEditAllowed && <p className="text-xs text-slate-500 mt-1 font-semibold">Tarik berkas Anda ke sini untuk mengunggah.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                
                {/* Render subfolders */}
                {folderFolders.map((sub) => (
                  <div 
                    key={sub.id} 
                    onClick={() => handleFolderClick(sub)}
                    className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#1c1e26]/50 border border-white/5 hover:border-[#fab795]/30 hover:bg-[#1c1e26]/85 hover:scale-[1.01] transition-all select-none cursor-pointer group"
                  >
                    <div className="p-2 bg-[#fab795]/10 text-[#fab795] rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                      <Folder className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate" title={sub.name}>
                      {sub.name}
                    </span>
                  </div>
                ))}

                {/* Render files */}
                {folderFiles.map((file) => {
                  const ext = file.originalFileName.split('.').pop() || '';
                  
                  return (
                    <div 
                      key={file.id} 
                      className="p-5 flex flex-col gap-4 rounded-3xl bg-[#1c1e26]/50 border border-white/5 hover:border-[#e95678]/30 hover:bg-[#1c1e26]/85 hover:scale-[1.01] transition-all text-left relative"
                    >
                      <div className="flex items-start justify-between">
                        <FileIcon type={ext} className="w-8 h-8 shrink-0" />
                        
                        {/* Action buttons */}
                        <div className="flex gap-1.5 shrink-0">
                          {file.id && (
                            <a
                              href={file.provider === 'GOOGLE_DRIVE' 
                                ? getPublicDownloadUrl(activeShareToken, 'google', true) + `&fileId=${file.id}`
                                : getPublicDownloadUrl(activeShareToken, 'local', true) + `&fileId=${file.id}`
                              }
                              download={file.originalFileName}
                              className="p-2 rounded-xl bg-white/5 hover:bg-[#fab795]/20 hover:text-[#fab795] text-slate-400 transition-all cursor-pointer"
                              title="Unduh"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {isEditAllowed && file.id && (
                            <button
                              onClick={() => handleDeleteFile(file.id, file.originalFileName)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#e95678] transition-all cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate" title={file.originalFileName}>
                          {file.originalFileName}
                        </p>
                        <div className="flex justify-between items-center mt-2.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{formatFileSize(file.size)}</span>
                          {file.createdAt && <span className="text-[9px] text-slate-500 font-medium">{new Date(file.createdAt).toLocaleDateString('id-ID')}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>

        <footer className="h-10 border-t border-white/5 bg-[#1c1e26]/30 text-center flex items-center justify-center text-[9px] text-slate-600 font-bold uppercase tracking-wider shrink-0">
          Horizon Drive &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // ───── RENDER 2: SHARED FILE VIEW ─────
  if (!fileInfo) return null;
  const category = getFileCategory(fileInfo.originalFileName);
  const activeProvider = provider || (fileInfo.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'google' : 'local');
  const downloadUrl = getPublicDownloadUrl(activeShareToken, activeProvider, true);

  return (
    <div className="min-h-screen h-screen w-screen bg-[#0f111a] flex flex-col text-white overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-[#1c1e26]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-[#e95678] to-[#fab795] rounded-xl flex items-center justify-center shadow-lg shadow-[#e95678]/25 shrink-0">
            <HardDrive className="w-5 h-5 text-[#0f111a]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[300px] md:max-w-[450px]" title={fileInfo.originalFileName}>
              {fileInfo.originalFileName}
            </h1>
            <p className="text-[9px] text-slate-450 font-bold flex items-center gap-2 mt-0.5 uppercase tracking-wide">
              <span>{formatFileSize(fileInfo.size)}</span>
              <span>•</span>
              <span className="truncate max-w-[100px] sm:max-w-none">{fileInfo.ownerEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline-flex bg-[#e95678]/10 border border-[#e95678]/20 text-[#e95678] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Berbagi Publik
          </span>
          <a 
            href={downloadUrl}
            download={fileInfo.originalFileName}
            className="inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-[0.98] bg-gradient-to-r from-[#e95678] to-[#fab795] text-[#0f111a] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#e95678]/10 text-xs py-2 px-4 gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh Berkas</span>
            <span className="sm:hidden">Unduh</span>
          </a>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="flex-1 w-full bg-[#0f111a] flex items-center justify-center relative overflow-hidden p-4">
        {isPreviewLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-[#0f111a]/40 z-10">
            <div className="w-12 h-12 border-4 border-[#e95678]/20 border-t-[#e95678] rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-450 mt-4 animate-pulse uppercase tracking-wider">Memuat pratinjau media...</p>
          </div>
        )}

        {previewError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-[#0f111a]/40 z-10 animate-fadeIn">
            <div className="w-16 h-16 bg-[#e95678]/10 border border-[#e95678]/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-[#e95678]" />
            </div>
            <h4 className="font-bold text-lg text-slate-200">Gagal Memuat Pratinjau</h4>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">{previewError}</p>
          </div>
        )}

        {!isPreviewLoading && !previewError && (objectUrl || textContent !== null) && (
          <div className="w-full h-full flex items-center justify-center overflow-auto">
            {category === 'image' && objectUrl && (
              <img 
                src={objectUrl} 
                alt={fileInfo.originalFileName} 
                onError={() => setPreviewError('Browser gagal memuat gambar ini. Kemungkinan format tidak didukung.')}
                className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/5 transition-transform duration-300 hover:scale-[1.01]" 
              />
            )}

            {category === 'pdf' && objectUrl && (
              isMobile ? (
                <div className="w-full max-w-md p-8 backdrop-blur-md bg-[#1c1e26]/60 border border-white/5 rounded-3xl text-center shadow-2xl mx-4">
                  <div className="mb-6 flex justify-center">
                    <FileText className="w-16 h-16 text-[#e95678] animate-pulse" />
                  </div>
                  <h3 className="font-bold text-white text-lg truncate mb-1" title={fileInfo.originalFileName}>
                    {fileInfo.originalFileName}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">{formatFileSize(fileInfo.size)}</p>
                  <p className="text-xs text-slate-450 mb-6 font-semibold">Pratinjau PDF tidak didukung di browser seluler.</p>
                  <button 
                    onClick={() => window.open(objectUrl || '', '_blank')}
                    className="w-full inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 hover:shadow-lg active:scale-[0.98] bg-[#e95678] text-white text-sm py-3 px-6 gap-2.5 hover:bg-[#e95678]/95"
                  >
                    Buka PDF di Tab Baru
                  </button>
                </div>
              ) : (
                <iframe 
                  src={objectUrl} 
                  title={fileInfo.originalFileName}
                  className="w-full h-full rounded-2xl border border-white/5 bg-white"
                />
              )
            )}

            {category === 'video' && objectUrl && (
              <video 
                src={objectUrl} 
                controls 
                onError={() => setPreviewError('Browser tidak dapat memutar video ini. Format/codec video ini kemungkinan tidak didukung oleh browser Anda.')}
                className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl border border-white/5 bg-black"
              />
            )}

            {category === 'audio' && objectUrl && (
              <div className="w-full max-w-md text-center p-8 backdrop-blur-md bg-[#1c1e26]/60 border border-white/5 rounded-3xl shadow-2xl mx-4">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-[#fab795]/10 border border-[#fab795]/20 rounded-2xl flex items-center justify-center shadow-inner animate-pulse">
                    <Music className="w-10 h-10 text-[#fab795]" />
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg truncate mb-1" title={fileInfo.originalFileName}>
                  {fileInfo.originalFileName}
                </h3>
                <p className="text-xs text-slate-500 mb-6">{formatFileSize(fileInfo.size)}</p>
                <audio 
                  src={objectUrl} 
                  controls 
                  onError={() => setPreviewError('Browser tidak dapat memutar audio ini. Format audio tidak didukung.')}
                  className="w-full" 
                />
              </div>
            )}

            {category === 'text' && textContent !== null && (
              <div className="w-full max-w-4xl h-[75vh] p-6 backdrop-blur-md bg-[#1c1e26]/70 border border-white/5 rounded-3xl overflow-auto text-left font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-text text-slate-100">
                {textContent}
              </div>
            )}
          </div>
        )}

        {!isPreviewLoading && !previewError && !objectUrl && textContent === null && category !== 'other' && (
          <div className="text-center text-slate-400 space-y-2 animate-fadeIn">
            <div className="w-10 h-10 border-4 border-[#e95678]/20 border-t-[#e95678] rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-bold uppercase tracking-wider">Menginisialisasi pratinjau...</p>
          </div>
        )}

        {!isPreviewLoading && !previewError && !objectUrl && textContent === null && category === 'other' && (
          <div className="w-full max-w-md p-8 backdrop-blur-md bg-[#1c1e26]/50 border border-white/5 rounded-3xl text-center shadow-2xl mx-4 animate-fadeIn">
            <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              {getFileIcon(category)}
            </div>
            <h3 className="font-bold text-white text-lg truncate mb-1" title={fileInfo.originalFileName}>
              {fileInfo.originalFileName}
            </h3>
            <p className="text-xs text-slate-500 mb-6">{formatFileSize(fileInfo.size)}</p>
            
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
              className="w-full inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#e95678]/10 active:scale-[0.98] bg-gradient-to-r from-[#e95678] to-[#fab795] text-[#0f111a] text-sm py-3 px-6 gap-2.5"
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
