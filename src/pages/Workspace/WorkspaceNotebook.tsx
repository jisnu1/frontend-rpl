import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Send, 
  Menu, 
  X, 
  Check, 
  PlusCircle, 
  Folder, 
  ChevronRight,
  AlertTriangle,
  FileCode,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import MarkdownRenderer from '../../components/ui/MarkdownRenderer';
import { 
  AiWorkspace, 
  AiWorkspaceFile, 
  AiWorkspaceNote, 
  AiWorkspaceMessage,
  fetchWorkspaces,
  createWorkspace,
  deleteWorkspace,
  fetchWorkspaceFiles,
  addWorkspaceFile,
  removeWorkspaceFile,
  fetchWorkspaceNotes,
  createWorkspaceNote,
  updateWorkspaceNote,
  deleteWorkspaceNote,
  getOrCreateActiveChat,
  fetchChatMessages,
  chatWorkspace,
  generateWorkspaceDoc
} from '../../api/workspace';
import { fetchMyFiles, FileResponse } from '../../api/files';
import { fetchFolderContents, fetchGoogleDriveFolderContents } from '../../api/folders';
import { fetchExternalAccounts, ExternalAccountDto } from '../../api/externalAccounts';
import Button from '../../components/ui/Button';

export default function WorkspaceNotebook() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // State: Workspaces list
  const [workspaces, setWorkspaces] = useState<AiWorkspace[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [wsToDelete, setWsToDelete] = useState<AiWorkspace | null>(null);

  // State: Active Workspace Detail
  const [selectedWorkspace, setSelectedWorkspace] = useState<AiWorkspace | null>(null);
  const [files, setFiles] = useState<AiWorkspaceFile[]>([]);
  const [notes, setNotes] = useState<AiWorkspaceNote[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Mobile navigation for left drawer
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);

  // Tabs inside Left Panel: 'sources' | 'notes'
  const [leftTab, setLeftTab] = useState<'sources' | 'notes'>('sources');

  // State: Notes form modal / editor
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<AiWorkspaceNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // State: File Picker Modal
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<'local' | 'gdrive'>('local');
  const [pickerLoading, setPickerLoading] = useState(false);
  
  // Local browsing states
  const [localFolders, setLocalFolders] = useState<any[]>([]);
  const [localFiles, setLocalFiles] = useState<FileResponse[]>([]);
  const [localPath, setLocalPath] = useState<{ id: string; name: string }[]>([]);
  const [currentLocalFolderId, setCurrentLocalFolderId] = useState<string | undefined>(undefined);

  // GDrive browsing states
  const [gdriveAccounts, setGdriveAccounts] = useState<ExternalAccountDto[]>([]);
  const [selectedGdriveAcc, setSelectedGdriveAcc] = useState<ExternalAccountDto | null>(null);
  const [gdriveItems, setGdriveItems] = useState<any[]>([]);
  const [gdrivePath, setGdrivePath] = useState<{ id: string; name: string }[]>([]);
  const [currentGdriveFolderId, setCurrentGdriveFolderId] = useState<string | undefined>(undefined);

  // State: Chat
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiWorkspaceMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // State: Generated Doc Preview
  const [generatedDoc, setGeneratedDoc] = useState<{ type: string; title: string; content: string } | null>(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // Token Limit / Plan Quotas calculation
  const getPlanInfo = () => {
    const tier = user?.subscriptionTier || 'FREEMIUM';
    if (tier === 'PREMIUM_INDIVIDUAL') {
      return { name: 'Premium Individual', limit: 150000, label: '150.000 Token Input' };
    } else if (tier === 'PREMIUM_ACADEMIC') {
      return { name: 'Academic', limit: 75000, label: '75.000 Token Input' };
    }
    return { name: 'Freemium', limit: 20000, label: '20.000 Token Input' };
  };

  const getWorkspaceLimitsInfo = () => {
    const tier = user?.subscriptionTier || 'FREEMIUM';
    if (tier === 'PREMIUM_INDIVIDUAL') return { label: 'Tak Terbatas', max: -1 };
    if (tier === 'PREMIUM_ACADEMIC') return { label: '15', max: 15 };
    return { label: '2', max: 2 };
  };

  // Estimate workspace tokens based on current file summaries and note lengths
  const getApproximateTokens = () => {
    // Estimasi kasar: 1 token ~ 4 karakter. 
    // Di backend, buildGroundingContext merangkum summary file dan isi catatan.
    // Kami gunakan ukuran data untuk menghitung estimasi token.
    let totalChars = 0;
    
    // Asumsi ringkasan file berukuran rata-rata ~1500 karakter per file
    files.forEach(() => {
      totalChars += 1500;
    });

    notes.forEach(note => {
      totalChars += (note.title.length + note.content.length);
    });

    return Math.round(totalChars / 4);
  };

  const approxTokens = getApproximateTokens();
  const planInfo = getPlanInfo();
  const isTokenLimitExceeded = approxTokens > planInfo.limit;

  // Load Workspaces list
  const loadWorkspacesList = async () => {
    setIsListLoading(true);
    try {
      const list = await fetchWorkspaces();
      setWorkspaces(list);
    } catch (err) {
      console.error(err);
      toastError('Gagal memuat daftar ruang kerja AI.');
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspacesList();
  }, []);

  // Handle Workspace creation
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreatingWorkspace(true);
    try {
      const limits = getWorkspaceLimitsInfo();
      if (limits.max !== -1 && workspaces.length >= limits.max) {
        throw new Error(`Batas maksimal ruang kerja terhubung (${limits.max}) telah tercapai untuk paket Anda.`);
      }

      await createWorkspace(newWorkspaceName.trim(), newWorkspaceDesc.trim());
      toastSuccess(`Ruang kerja "${newWorkspaceName}" berhasil dibuat.`);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
      setIsCreateModalOpen(false);
      loadWorkspacesList();
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Gagal membuat ruang kerja baru.');
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  // Handle Workspace deletion
  const handleDeleteWorkspace = async () => {
    if (!wsToDelete) return;
    try {
      await deleteWorkspace(wsToDelete.id);
      toastSuccess(`Ruang kerja "${wsToDelete.name}" berhasil dihapus.`);
      setWsToDelete(null);
      loadWorkspacesList();
    } catch (err) {
      console.error(err);
      toastError('Gagal menghapus ruang kerja.');
    }
  };

  // Enter workspace
  const handleEnterWorkspace = async (ws: AiWorkspace) => {
    setIsDetailLoading(true);
    setSelectedWorkspace(ws);
    setLeftTab('sources');
    setMessages([]);
    try {
      // Load sources
      const wsFiles = await fetchWorkspaceFiles(ws.id);
      setFiles(wsFiles);

      // Load notes
      const wsNotes = await fetchWorkspaceNotes(ws.id);
      setNotes(wsNotes);

      // Load active chat & messages
      const chat = await getOrCreateActiveChat(ws.id);
      setActiveChatId(chat.id);
      
      const prevMsgs = await fetchChatMessages(chat.id);
      setMessages(prevMsgs);

      // Scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error(err);
      toastError('Gagal masuk ke ruang kerja.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Exit Workspace Detail
  const handleExitWorkspace = () => {
    setSelectedWorkspace(null);
    setFiles([]);
    setNotes([]);
    setActiveChatId(null);
    setMessages([]);
    loadWorkspacesList();
  };

  // Add source file trigger
  const handleOpenSourcePicker = async () => {
    setIsFilePickerOpen(true);
    setPickerTab('local');
    setLocalPath([]);
    setCurrentLocalFolderId(undefined);
    await loadLocalPickerContents();
  };

  // Local Storage Picker Contents
  const loadLocalPickerContents = async (folderId?: string) => {
    setPickerLoading(true);
    try {
      const data = await fetchFolderContents(folderId);
      setLocalFolders(data.folders || []);
      setLocalFiles(data.files || []);
    } catch (err) {
      console.error(err);
      toastError('Gagal memuat berkas cloud lokal.');
    } finally {
      setPickerLoading(false);
    }
  };

  const handleLocalFolderClick = async (folder: any) => {
    const nextPath = [...localPath, { id: folder.id, name: folder.name }];
    setLocalPath(nextPath);
    setCurrentLocalFolderId(folder.id);
    await loadLocalPickerContents(folder.id);
  };

  const handleLocalBackClick = async () => {
    if (localPath.length === 0) return;
    const nextPath = localPath.slice(0, -1);
    setLocalPath(nextPath);
    const parentId = nextPath.length > 0 ? nextPath[nextPath.length - 1].id : undefined;
    setCurrentLocalFolderId(parentId);
    await loadLocalPickerContents(parentId);
  };

  // Google Drive Picker Contents
  const loadGDriveAccounts = async () => {
    try {
      const accs = await fetchExternalAccounts();
      const gaccs = accs.filter(a => a.provider.toUpperCase().startsWith('GOOGLE'));
      setGdriveAccounts(gaccs);
      if (gaccs.length > 0) {
        setSelectedGdriveAcc(gaccs[0]);
        await loadGDrivePickerContents(gaccs[0].id, undefined);
      }
    } catch (err) {
      console.error(err);
      toastError('Gagal memuat akun Google Drive terhubung.');
    }
  };

  const loadGDrivePickerContents = async (accountId: number, folderId?: string) => {
    setPickerLoading(true);
    try {
      const data = await fetchGoogleDriveFolderContents(accountId, folderId);
      setGdriveItems(data.items || []);
    } catch (err) {
      console.error(err);
      toastError('Gagal memuat berkas Google Drive.');
    } finally {
      setPickerLoading(false);
    }
  };

  const handleGdriveFolderClick = async (item: any) => {
    if (!selectedGdriveAcc) return;
    const nextPath = [...gdrivePath, { id: item.id, name: item.name }];
    setGdrivePath(nextPath);
    setCurrentGdriveFolderId(item.id);
    await loadGDrivePickerContents(selectedGdriveAcc.id, item.id);
  };

  const handleGdriveBackClick = async () => {
    if (!selectedGdriveAcc || gdrivePath.length === 0) return;
    const nextPath = gdrivePath.slice(0, -1);
    setGdrivePath(nextPath);
    const parentId = nextPath.length > 0 ? nextPath[nextPath.length - 1].id : undefined;
    setCurrentGdriveFolderId(parentId);
    await loadGDrivePickerContents(selectedGdriveAcc.id, parentId);
  };

  useEffect(() => {
    if (isFilePickerOpen) {
      if (pickerTab === 'local') {
        loadLocalPickerContents(currentLocalFolderId);
      } else {
        loadGDriveAccounts();
      }
    }
  }, [pickerTab, isFilePickerOpen]);

  // Select GDrive account
  const handleGdriveAccountChange = async (accId: number) => {
    const matching = gdriveAccounts.find(a => a.id === accId);
    if (matching) {
      setSelectedGdriveAcc(matching);
      setGdrivePath([]);
      setCurrentGdriveFolderId(undefined);
      await loadGDrivePickerContents(accId, undefined);
    }
  };

  // Add selected file from picker to workspace
  const handleSelectFile = async (fileId: string, fileName: string) => {
    if (!selectedWorkspace) return;
    // Check extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'xlsx', 'xls', 'jpg', 'jpeg', 'png'];
    if (!ext || !validExtensions.includes(ext)) {
      toastError(`Format file .${ext || ''} tidak didukung. Silakan pilih PDF, Excel, atau JPG.`);
      return;
    }

    try {
      await addWorkspaceFile(selectedWorkspace.id, fileId);
      toastSuccess(`Berhasil mengaitkan "${fileName}" ke ruang kerja. Ringkasan di latar belakang sedang dibuat.`);
      setIsFilePickerOpen(false);
      
      // Reload workspace files
      const wsFiles = await fetchWorkspaceFiles(selectedWorkspace.id);
      setFiles(wsFiles);
    } catch (err) {
      console.error(err);
      toastError('Gagal menambahkan berkas ke ruang kerja.');
    }
  };

  // Remove workspace file source
  const handleRemoveFile = async (fileId: string) => {
    if (!selectedWorkspace) return;
    try {
      await removeWorkspaceFile(selectedWorkspace.id, fileId);
      toastSuccess('Berkas sumber berhasil dilepas.');
      // Reload
      const wsFiles = await fetchWorkspaceFiles(selectedWorkspace.id);
      setFiles(wsFiles);
    } catch (err) {
      console.error(err);
      toastError('Gagal melepaskan berkas.');
    }
  };

  // Create Note trigger
  const handleOpenNoteModal = (note?: AiWorkspaceNote) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
    }
    setIsNoteModalOpen(true);
  };

  // Save / Update Note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace || !noteTitle.trim() || !noteContent.trim()) return;

    setIsSavingNote(true);
    try {
      if (editingNote) {
        await updateWorkspaceNote(editingNote.id, noteTitle.trim(), noteContent.trim());
        toastSuccess('Catatan berhasil diperbarui.');
      } else {
        await createWorkspaceNote(selectedWorkspace.id, noteTitle.trim(), noteContent.trim());
        toastSuccess('Catatan berhasil ditambahkan.');
      }
      setIsNoteModalOpen(false);
      
      // Reload
      const wsNotes = await fetchWorkspaceNotes(selectedWorkspace.id);
      setNotes(wsNotes);
    } catch (err) {
      console.error(err);
      toastError('Gagal menyimpan catatan.');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;
    try {
      await deleteWorkspaceNote(noteId);
      toastSuccess('Catatan berhasil dihapus.');
      // Reload
      const wsNotes = await fetchWorkspaceNotes(selectedWorkspace!.id);
      setNotes(wsNotes);
    } catch (err) {
      console.error(err);
      toastError('Gagal menghapus catatan.');
    }
  };

  // Chat send action
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace || !activeChatId || !chatInput.trim() || isAiTyping) return;

    if (isTokenLimitExceeded) {
      toastError(`Batas kuota token input terlampaui. Kurangi berkas sumber di panel kiri.`);
      return;
    }

    const textToSend = chatInput.trim();
    setChatInput('');
    setIsAiTyping(true);

    // Optimistic local add
    const userMsg: AiWorkspaceMessage = {
      id: String(Date.now()),
      chatId: activeChatId,
      role: 'USER',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const reply = await chatWorkspace(selectedWorkspace.id, activeChatId, textToSend);
      
      const assistantMsg: AiWorkspaceMessage = {
        id: String(Date.now() + 1),
        chatId: activeChatId,
        role: 'ASSISTANT',
        content: reply,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Gagal memproses jawaban AI. Periksa batas kuota atau ukuran dokumen.';
      
      // Add error response block in chat
      const errorMsg: AiWorkspaceMessage = {
        id: String(Date.now() + 2),
        chatId: activeChatId,
        role: 'ASSISTANT',
        content: `❌ **Error**: ${errMsg}`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      toastError(errMsg);
    } finally {
      setIsAiTyping(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Auto-Gen Quick Document Action
  const handleGenerateDoc = async (type: 'faq' | 'study-guide' | 'briefing') => {
    if (!selectedWorkspace) return;
    if (files.length === 0 && notes.length === 0) {
      toastError('Tambahkan berkas atau catatan terlebih dahulu agar AI memiliki referensi.');
      return;
    }
    if (isTokenLimitExceeded) {
      toastError('Batas kuota token terlampaui. Kurangi berkas sumber di panel kiri.');
      return;
    }

    setIsGeneratingDoc(true);
    let title = '';
    if (type === 'faq') title = 'Frequently Asked Questions (FAQ)';
    else if (type === 'study-guide') title = 'Study Guide (Panduan Belajar)';
    else title = 'Briefing Document (Ringkasan Eksekutif)';

    try {
      const responseText = await generateWorkspaceDoc(selectedWorkspace.id, type);
      setGeneratedDoc({
        type,
        title,
        content: responseText
      });
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal menghasilkan dokumen. Periksa kuota Anda.');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // Helper for size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to copy text
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess('Teks berhasil disalin ke papan klip!');
  };

  return (
    <div className="w-full h-full min-h-0 bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. LIST VIEW: WORKSPACES SELECTION
          ───────────────────────────────────────────────────────────── */}
      {!selectedWorkspace && (
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 max-w-6xl mx-auto w-full space-y-8">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-indigo-900 to-indigo-850 p-6 md:p-8 rounded-[2rem] text-white shadow-xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase text-indigo-200">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span>Asisten Notebook AI</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Notebook LLM Workspaces</h1>
              <p className="text-sm text-indigo-150 max-w-xl font-medium">
                Pusatkan bahan belajar Anda. Unggah dokumen PDF, Excel, dan JPG, buat catatan kustom, lalu lakukan tanya-jawab terfokus yang dibatasi batas token ketat.
              </p>
            </div>
            
            <Button
              variant="secondary"
              className="bg-emerald-500 hover:bg-emerald-600 border-none text-white font-extrabold py-3.5 px-6 rounded-2xl hover:scale-[1.03] transition-all shrink-0 shadow-lg"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Workspace Baru
            </Button>
          </div>

          {/* Quota limit warnings */}
          <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kuota Ruang Kerja Aktif</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {workspaces.length} dari {getWorkspaceLimitsInfo().label} Workspace Terpakai
                </p>
              </div>
            </div>
            
            <div className="text-right hidden sm:block">
              <span className="inline-flex px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">
                Paket: {planInfo.name}
              </span>
            </div>
          </div>

          {/* Workspaces list grid */}
          {isListLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 bg-white border border-slate-150 rounded-3xl p-6 space-y-4 animate-pulse">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3.5 bg-slate-50 rounded w-5/6 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-150 rounded-3xl shadow-sm">
              <Brain className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Belum ada Workspace</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 font-semibold">
                Buat workspace pertama Anda untuk mulai mengelompokkan dokumen dan catatan untuk sesi chat grounded.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-6 font-bold"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Buat Workspace Baru
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((ws) => (
                <div 
                  key={ws.id}
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all flex flex-col justify-between group relative overflow-hidden h-48"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                        <Brain className="w-5 h-5" />
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setWsToDelete(ws);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Hapus Workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 truncate pr-4">{ws.name}</h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {ws.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">
                      {new Date(ws.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => handleEnterWorkspace(ws)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. WORKSPACE DETAIL & NOTEBOOKLM VIEW
          ───────────────────────────────────────────────────────────── */}
      {selectedWorkspace && (
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* Sub Header / Bar */}
          <div className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={handleExitWorkspace}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Kembali"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-slate-800 truncate">{selectedWorkspace.name}</h2>
                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-[9px] font-bold text-indigo-600 uppercase tracking-wide">
                    Notebook
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 truncate font-semibold">
                  {selectedWorkspace.description || 'Sesi grounded notebook AI.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Token Quota display */}
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold ${
                isTokenLimitExceeded
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-slate-50 border-slate-200 text-slate-650'
              }`}>
                <AlertCircle className={`w-3.5 h-3.5 ${isTokenLimitExceeded ? 'text-red-500' : 'text-slate-400'}`} />
                <span>
                  {approxTokens.toLocaleString()} / {planInfo.limit.toLocaleString()} Token referensi
                </span>
              </div>

              {/* Mobile Sidebar Hamburger Toggle */}
              <button
                onClick={() => setIsLeftDrawerOpen(true)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
                title="Menu Panel"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
            </div>
          </div>

          {/* Core Body Container */}
          <div className="flex-1 flex min-h-0 w-full relative">
            
            {/* LEFT DRAWER OVERLAY (MOBILE ONLY) */}
            {isLeftDrawerOpen && (
              <div 
                className="fixed inset-0 bg-slate-900/60 z-30 transition-opacity duration-200 md:hidden"
                onClick={() => setIsLeftDrawerOpen(false)}
              />
            )}

            {/* ───── LEFT SIDEBAR: SOURCES & NOTES ───── */}
            <div className={`
              fixed top-0 bottom-0 left-0 w-[300px] md:w-[320px] bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 md:static md:translate-x-0 shrink-0
              ${isLeftDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              
              {/* Drawer Header for mobile */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between md:hidden">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Sumber & Catatan</span>
                <button 
                  onClick={() => setIsLeftDrawerOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Left sidebar tabs */}
              <div className="flex border-b border-slate-100 shrink-0">
                <button
                  onClick={() => setLeftTab('sources')}
                  className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    leftTab === 'sources' 
                      ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Dokumen ({files.length})
                </button>
                <button
                  onClick={() => setLeftTab('notes')}
                  className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    leftTab === 'notes' 
                      ? 'border-indigo-650 text-indigo-650 bg-indigo-50/10'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Catatan ({notes.length})
                </button>
              </div>

              {/* Left panel scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* ──── LEFT TAB: SOURCES (DOCUMENTS) ──── */}
                {leftTab === 'sources' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Pendukung</span>
                      <button
                        onClick={handleOpenSourcePicker}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kaitkan Berkas</span>
                      </button>
                    </div>

                    {isDetailLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : files.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-450 font-bold">Belum ada Dokumen</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 px-6 font-semibold">
                          Tambahkan file PDF, Excel, atau JPG sebagai basis grounding AI.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {files.map((file) => {
                          const ext = file.originalFileName.split('.').pop()?.toLowerCase();
                          return (
                            <div 
                              key={file.id}
                              className="group p-3 rounded-2xl bg-white border border-slate-150 hover:border-slate-350 shadow-sm flex items-center justify-between gap-3 relative transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate" title={file.originalFileName}>
                                    {file.originalFileName}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                    {formatSize(file.size)} • {file.provider === 'STORAGE_NODE' ? 'Local' : 'GDrive'}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                                title="Lepas Berkas"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Token Limit Warning inside left panel */}
                    {isTokenLimitExceeded && (
                      <div className="p-3 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-2.5">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-red-800">Token Limit Terlampaui!</p>
                          <p className="text-[9px] text-red-700 mt-0.5 leading-relaxed font-semibold">
                            Konteks referensi saat ini ({approxTokens.toLocaleString()} token) melebihi batas maksimal akun Anda ({planInfo.limit.toLocaleString()} token). AI tidak akan merespon hingga beberapa berkas dilepas.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* ──── LEFT TAB: NOTES ──── */}
                {leftTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catatan Belajar</span>
                      <button
                        onClick={() => handleOpenNoteModal()}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat Catatan</span>
                      </button>
                    </div>

                    {isDetailLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                        <FileCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-450 font-bold">Belum ada Catatan</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 px-6 font-semibold">
                          Tulis pemikiran atau kutipan kustom Anda untuk dirujuk AI.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <div 
                            key={note.id}
                            className="group p-4 rounded-2xl bg-white border border-slate-150 hover:border-slate-350 shadow-sm transition-all space-y-2 relative"
                          >
                            <div className="pr-12">
                              <h4 className="text-xs font-bold text-slate-800 truncate" title={note.title}>{note.title}</h4>
                              <p className="text-[10px] text-slate-500 line-clamp-3 mt-1 leading-relaxed font-semibold">
                                {note.content}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                              <span className="text-[8px] text-slate-400 font-bold uppercase">
                                {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                              </span>

                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenNoteModal(note)}
                                  className="p-1 rounded text-slate-400 hover:text-indigo-650 hover:bg-slate-55 cursor-pointer"
                                  title="Edit Catatan"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="Hapus Catatan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* ───── CENTER PANEL: GROUNDED CHAT & ACTIONS ───── */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#FAFBFD] relative">
              
              {/* Doc Auto-Generations Panel Bar */}
              <div className="bg-white border-b border-slate-150 p-3 flex flex-wrap gap-2 items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">
                  Aksi Cepat AI:
                </span>
                
                <div className="flex flex-wrap gap-1.5 flex-1 justify-start">
                  <button
                    disabled={isGeneratingDoc}
                    onClick={() => handleGenerateDoc('faq')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0052cc]/5 hover:bg-[#0052cc]/10 border border-[#0052cc]/15 text-[#0052cc] rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hasilkan FAQ</span>
                  </button>

                  <button
                    disabled={isGeneratingDoc}
                    onClick={() => handleGenerateDoc('study-guide')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00875a]/5 hover:bg-[#00875a]/10 border border-[#00875a]/15 text-[#00875a] rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Study Guide</span>
                  </button>

                  <button
                    disabled={isGeneratingDoc}
                    onClick={() => handleGenerateDoc('briefing')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#de350b]/5 hover:bg-[#de350b]/10 border border-[#de350b]/15 text-[#de350b] rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Briefing Doc</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread Container */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
                
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 px-6 py-10">
                    <div className="w-16 h-16 rounded-[1.75rem] bg-indigo-50 text-indigo-650 flex items-center justify-center shadow-md">
                      <Brain className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Notebook Grounded Chat</h3>
                      <p className="text-xs text-slate-450 mt-1 max-w-sm font-semibold">
                        Kirimkan pertanyaan di bawah. AI akan menjawab HANYA berdasarkan referensi dokumen terunggah dan catatan aktif di samping.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {messages.map((msg) => {
                      const isUser = msg.role === 'USER';
                      return (
                        <div 
                          key={msg.id}
                          className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                          {/* AI Icon */}
                          {!isUser && (
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm font-black">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          )}

                          {/* Message bubble */}
                          <div className={`
                            max-w-[85%] rounded-[1.5rem] px-4 py-3 shadow-[0px_2px_8px_rgba(15,23,42,0.02)]
                            ${isUser 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none'}
                          `}>
                            {isUser ? (
                              <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              <MarkdownRenderer text={msg.content} />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {isAiTyping && (
                      <div className="flex gap-3 justify-start animate-pulse">
                        <div className="w-8 h-8 rounded-xl bg-indigo-650 text-white flex items-center justify-center shrink-0 shadow-sm font-black">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-slate-150 rounded-[1.5rem] rounded-tl-none px-4 py-3 shadow-[0px_2px_8px_rgba(15,23,42,0.02)]">
                          <div className="flex items-center gap-1.5 py-1">
                            <div className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>
                )}

              </div>

              {/* Chat Input Area Footer */}
              <div className="bg-white border-t border-slate-200/80 p-4 shrink-0">
                <form onSubmit={handleSendChat} className="max-w-3xl mx-auto flex items-center gap-3">
                  
                  <input
                    type="text"
                    disabled={isAiTyping || isTokenLimitExceeded}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isTokenLimitExceeded 
                        ? 'Token limit terlampaui. Lepas beberapa file.' 
                        : 'Kirim pertanyaan berdasarkan dokumen & catatan aktif...'
                    }
                    className="flex-1 px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-xs font-semibold bg-[#FAFBFD] disabled:opacity-50 outline-none transition-all shadow-inner"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isAiTyping || isTokenLimitExceeded}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md transition-all hover:scale-[1.03] disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                </form>
              </div>

            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              SLIDING DRAWER / POPUP PREVIEW FOR GENERATED DOCS
              ───────────────────────────────────────────────────────────── */}
          {generatedDoc && (
            <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-end animate-fadeIn">
              <div className="w-full md:w-[600px] h-full bg-white flex flex-col shadow-2xl animate-slideLeft">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex px-2 py-0.5 bg-indigo-50 rounded-full text-[9px] font-bold text-indigo-600 uppercase tracking-wide">
                      Dokumen AI Generasi
                    </span>
                    <h3 className="text-sm font-black text-slate-800">{generatedDoc.title}</h3>
                  </div>
                  
                  <button 
                    onClick={() => setGeneratedDoc(null)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-450 transition-colors"
                  >
                    <X className="w-5.5 h-5.5" />
                  </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                  <div className="prose prose-slate max-w-none">
                    <MarkdownRenderer text={generatedDoc.content} />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t border-slate-150 flex items-center justify-end gap-3 bg-slate-50/50">
                  <button
                    onClick={() => setGeneratedDoc(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-white text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard(generatedDoc.content)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Konten</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. DIALOG MODAL: CREATE WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 border border-slate-100 animate-scaleUp">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-800">Workspace Baru</h3>
              </div>

              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-slate-450 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nama Ruang Kerja
                </label>
                <input
                  type="text"
                  required
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Misal: Proyek Rekayasa Perangkat Lunak"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none outline-0 transition-all bg-[#FAFBFD]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Deskripsi Singkat
                </label>
                <textarea
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  placeholder="Kelompokkan tugas RPL, PR analisis dokumen, dll."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none outline-0 transition-all bg-[#FAFBFD] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button 
                  variant="secondary" 
                  disabled={isCreatingWorkspace}
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  isLoading={isCreatingWorkspace}
                >
                  Buat Ruang Kerja
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. DIALOG MODAL: CONFIRM WORKSPACE DELETE
          ───────────────────────────────────────────────────────────── */}
      {wsToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-slate-100 animate-scaleUp">
            <div className="flex items-center gap-2.5 text-red-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-black">Hapus Workspace?</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Apakah Anda yakin ingin menghapus workspace <strong className="text-slate-800 font-bold">"{wsToDelete.name}"</strong>? Seluruh catatan, sesi obrolan, dan kaitan dokumen di dalamnya akan dihapus permanen. File asli Anda tidak akan terhapus.
            </p>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50">
              <Button variant="secondary" onClick={() => setWsToDelete(null)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteWorkspace}>
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. DIALOG MODAL: CREATE / EDIT NOTE
          ───────────────────────────────────────────────────────────── */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 border border-slate-100 animate-scaleUp">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-800">
                  {editingNote ? 'Edit Catatan' : 'Buat Catatan Baru'}
                </h3>
              </div>

              <button 
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-full text-slate-450 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Judul Catatan
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Misal: Teori Model View Controller (MVC)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none outline-0 transition-all bg-[#FAFBFD]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Isi Catatan (Akan dibaca AI)
                </label>
                <textarea
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Tuliskan catatan penting Anda di sini..."
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none outline-0 transition-all bg-[#FAFBFD] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button 
                  variant="secondary" 
                  disabled={isSavingNote}
                  onClick={() => setIsNoteModalOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  isLoading={isSavingNote}
                >
                  Simpan
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. DIALOG MODAL: DOCUMENT SOURCE PICKER (CLOUD & GDRIVE)
          ───────────────────────────────────────────────────────────── */}
      {isFilePickerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl h-[550px] shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Kaitkan Dokumen Baru</h3>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5">
                    Pilih file pendukung PDF, Excel, atau JPG dari Cloud Storage Anda.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsFilePickerOpen(false)}
                className="p-1 rounded-full text-slate-450 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs selector */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">
              <button
                onClick={() => setPickerTab('local')}
                className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  pickerTab === 'local' 
                    ? 'border-indigo-650 text-indigo-650 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Horizon Storage
              </button>
              <button
                onClick={() => setPickerTab('gdrive')}
                className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  pickerTab === 'gdrive' 
                    ? 'border-indigo-650 text-indigo-650 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Google Drive
              </button>
            </div>

            {/* Folder Navigation bar inside Picker */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between shrink-0 text-xs text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                
                {pickerTab === 'local' ? (
                  <>
                    <button 
                      onClick={() => {
                        setLocalPath([]);
                        setCurrentLocalFolderId(undefined);
                        loadLocalPickerContents(undefined);
                      }}
                      className="hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      Root
                    </button>
                    {localPath.map((p, idx) => (
                      <React.Fragment key={p.id}>
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <button
                          onClick={() => {
                            const nextPath = localPath.slice(0, idx + 1);
                            setLocalPath(nextPath);
                            setCurrentLocalFolderId(p.id);
                            loadLocalPickerContents(p.id);
                          }}
                          className="hover:text-indigo-600 transition-colors cursor-pointer max-w-[100px] truncate"
                        >
                          {p.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        if (selectedGdriveAcc) {
                          setGdrivePath([]);
                          setCurrentGdriveFolderId(undefined);
                          loadGDrivePickerContents(selectedGdriveAcc.id, undefined);
                        }
                      }}
                      className="hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      Drive Root
                    </button>
                    {gdrivePath.map((p, idx) => (
                      <React.Fragment key={p.id}>
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <button
                          onClick={() => {
                            if (selectedGdriveAcc) {
                              const nextPath = gdrivePath.slice(0, idx + 1);
                              setGdrivePath(nextPath);
                              setCurrentGdriveFolderId(p.id);
                              loadGDrivePickerContents(selectedGdriveAcc.id, p.id);
                            }
                          }}
                          className="hover:text-indigo-600 transition-colors cursor-pointer max-w-[100px] truncate"
                        >
                          {p.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </>
                )}

              </div>

              {pickerTab === 'gdrive' && gdriveAccounts.length > 0 && (
                <select
                  value={selectedGdriveAcc?.id || ''}
                  onChange={(e) => handleGdriveAccountChange(Number(e.target.value))}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 outline-none cursor-pointer"
                >
                  {gdriveAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.email}</option>
                  ))}
                </select>
              )}
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-5">
              
              {pickerLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-7 w-7 text-indigo-650" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs text-slate-400 font-bold">Membuka direktori...</span>
                  </div>
                </div>
              ) : pickerTab === 'local' ? (
                // ──── LOCAL ITEMS BROWSER ────
                <div>
                  
                  {/* Up directory */}
                  {localPath.length > 0 && (
                    <div 
                      onClick={handleLocalBackClick}
                      className="p-2.5 border-b border-slate-50 flex items-center gap-3 hover:bg-slate-50 cursor-pointer text-xs font-bold text-indigo-600 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali ke Atas</span>
                    </div>
                  )}

                  {/* Folders */}
                  {localFolders.map(folder => (
                    <div 
                      key={folder.id}
                      onClick={() => handleLocalFolderClick(folder)}
                      className="p-3 border-b border-slate-50 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <Folder className="w-4.5 h-4.5 text-primary" />
                      <span className="text-xs font-bold text-slate-700 truncate">{folder.name}</span>
                    </div>
                  ))}

                  {/* Files */}
                  {localFiles.map(file => {
                    const ext = file.originalFileName.split('.').pop()?.toLowerCase();
                    const validExtensions = ['pdf', 'xlsx', 'xls', 'jpg', 'jpeg', 'png'];
                    const isValid = ext && validExtensions.includes(ext);

                    return (
                      <div 
                        key={file.id}
                        onClick={() => isValid && handleSelectFile(file.id, file.originalFileName)}
                        className={`p-3 border-b border-slate-50 flex items-center justify-between gap-3 transition-colors ${
                          isValid 
                            ? 'hover:bg-slate-50 cursor-pointer' 
                            : 'opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className={`w-4.5 h-4.5 ${isValid ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-700 truncate pr-2" title={file.originalFileName}>
                            {file.originalFileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold">{formatSize(file.size)}</span>
                          {isValid ? (
                            <PlusCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <span className="text-[8px] px-1 py-0.5 bg-slate-100 rounded text-slate-400 font-black">UNSUPPORTED</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {localFolders.length === 0 && localFiles.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-bold text-xs">
                      Folder ini kosong.
                    </div>
                  )}

                </div>
              ) : (
                // ──── GDRIVE ITEMS BROWSER ────
                <div>
                  
                  {gdriveAccounts.length === 0 ? (
                    <div className="text-center py-20 text-slate-450 font-bold text-xs">
                      Tidak ada akun Google Drive terhubung. Silakan hubungkan akun Google di Dashboard utama.
                    </div>
                  ) : (
                    <>
                      {/* Up Directory */}
                      {gdrivePath.length > 0 && (
                        <div 
                          onClick={handleGdriveBackClick}
                          className="p-2.5 border-b border-slate-50 flex items-center gap-3 hover:bg-slate-50 cursor-pointer text-xs font-bold text-indigo-600 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Kembali ke Atas</span>
                        </div>
                      )}

                      {/* Items */}
                      {gdriveItems.map((item) => {
                        const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
                        const ext = item.name.split('.').pop()?.toLowerCase();
                        const validExtensions = ['pdf', 'xlsx', 'xls', 'jpg', 'jpeg', 'png'];
                        const isValid = isFolder || (ext && validExtensions.includes(ext));

                        return (
                          <div 
                            key={item.id}
                            onClick={() => {
                              if (!isValid) return;
                              if (isFolder) {
                                handleGdriveFolderClick(item);
                              } else {
                                handleSelectFile(item.id, item.name);
                              }
                            }}
                            className={`p-3 border-b border-slate-50 flex items-center justify-between gap-3 transition-colors ${
                              isValid 
                                ? 'hover:bg-slate-50 cursor-pointer' 
                                : 'opacity-45 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {isFolder ? (
                                <Folder className="w-4.5 h-4.5 text-primary shrink-0" />
                              ) : (
                                <FileText className={`w-4.5 h-4.5 shrink-0 ${isValid ? 'text-indigo-650' : 'text-slate-400'}`} />
                              )}
                              <span className="text-xs font-bold text-slate-700 truncate pr-2" title={item.name}>
                                {item.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              {!isFolder && item.size && (
                                <span className="text-[10px] text-slate-400 font-bold">{formatSize(item.size)}</span>
                              )}
                              {isValid ? (
                                <PlusCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <span className="text-[8px] px-1 py-0.5 bg-slate-100 rounded text-slate-400 font-black">UNSUPPORTED</span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {gdriveItems.length === 0 && (
                        <div className="text-center py-20 text-slate-400 font-bold text-xs">
                          Folder Drive ini kosong.
                        </div>
                      )}
                    </>
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
