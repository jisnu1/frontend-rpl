import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cloud, 
  Database, 
  RefreshCw, 
  FileText, 
  MessageSquareWarning, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Send,
  X,
  Sparkles,
  Share2,
  Check,
  Cpu,
  Layers,
  Sliders,
  HardDrive,
  AlertTriangle,
  Loader2,
  File,
  Menu
} from 'lucide-react';
import { submitBugReport } from '../../api/reports';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePricingTab, setActivePricingTab] = useState<'freemium' | 'academic' | 'premium'>('academic');

  // SEO Dynamic Meta Configuration
  useEffect(() => {
    document.title = "Horizon Cloud - Solusi Migrasi & Manajemen Multi Cloud Storage";
    
    // Set meta description dynamically
    let metaDesc = document.querySelector('meta[name="description"]');
    const descContent = "Hubungkan Google Drive dengan Penyimpanan Cloud personal (VPS Storage Node) Anda. Lakukan migrasi data server-to-server instan, kelola berkas secara terpadu, dan gunakan Asisten AI untuk merangkum dokumen secara privat.";
    if (metaDesc) {
      metaDesc.setAttribute("content", descContent);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', descContent);
      document.head.appendChild(metaDesc);
    }
    
    // Set Open Graph tags dynamically
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', "Horizon Cloud - Solusi Migrasi & Manajemen Multi Cloud Storage");
    if (!document.querySelector('meta[property="og:title"]')) document.head.appendChild(ogTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    ogDesc.setAttribute('content', descContent);
    if (!document.querySelector('meta[property="og:description"]')) document.head.appendChild(ogDesc);
  }, []);

  // FAQ accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Showcase tab states
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'migration' | 'ai' | 'storage'>('migration');

  // --- INTERACTIVE DEMO STATES ---
  // Custom Alert Modal States
  const [showDemoAlert, setShowDemoAlert] = useState(false);
  const [demoAlertTitle, setDemoAlertTitle] = useState('Informasi Demo');
  const [demoAlertMessage, setDemoAlertMessage] = useState('');

  const triggerDemoAlert = (title: string, message: string) => {
    setDemoAlertTitle(title);
    setDemoAlertMessage(message);
    setShowDemoAlert(true);
  };

  // Helper function to format bytes dynamically
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  // Helper function to get provider name and icon dynamically
  const getProviderVisuals = (provider: string) => {
    switch (provider) {
      case 'GOOGLE_DRIVE':
        return { name: 'Google Drive', icon: <HardDrive className="w-3.5 h-3.5 text-sky-500 shrink-0" /> };
      case 'DROPBOX':
        return { name: 'Dropbox', icon: <Cloud className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> };
      case 'ONEDRIVE':
        return { name: 'OneDrive', icon: <Cloud className="w-3.5 h-3.5 text-blue-500 shrink-0" /> };
      case 'STORAGE_NODE':
        return { name: 'VPS Storage 1', icon: <Database className="w-3.5 h-3.5 text-primary shrink-0" /> };
      case 'STORAGE_NODE_2':
        return { name: 'VPS Storage 2', icon: <Database className="w-3.5 h-3.5 text-purple-600 shrink-0" /> };
      default:
        return { name: provider, icon: <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" /> };
    }
  };

  // 1. Migration Demo
  const [migrationChecked, setMigrationChecked] = useState<number[]>([0, 1]);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationSpeed, setMigrationSpeed] = useState('0 MB/s');
  const [sourceProvider, setSourceProvider] = useState('GOOGLE_DRIVE');
  const [targetProvider, setTargetProvider] = useState('STORAGE_NODE');
  
  const [migrationFiles, setMigrationFiles] = useState([
    { name: '📄 Tugas_Praktikum_RPL.zip', size: '250 MB' },
    { name: '📄 Video_Presentasi_Horizon.mp4', size: '1.8 GB' },
    { name: '📄 Jurnal_Riset_Infrastruktur.pdf', size: '15 MB' },
    { name: '📄 Dataset_ML_Kuantitatif.csv', size: '850 MB' }
  ]);

  // 2. AI Workspace Demo
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Halo! Saya asisten AI Horizon. Silakan klik pertanyaan siap-pakai di bawah, ketik pesan kustom, atau tautkan berkas lokal Anda untuk mulai menganalisis!' }
  ]);
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [aiCustomInput, setAiCustomInput] = useState('');
  const [aiSelectedDoc, setAiSelectedDoc] = useState('Laporan_Kinerja_Q4.pdf');
  const [aiWorkspaceFiles, setAiWorkspaceFiles] = useState([
    { name: 'Laporan_Kinerja_Q4.pdf', size: '12.8 MB', type: 'PDF Ringkasan' },
    { name: 'Jurnal_Riset_AI.pdf', size: '4.5 MB', type: 'Dokumen Riset' }
  ]);

  // 3. Storage Node Demo
  const [storageFiles, setStorageFiles] = useState([
    { id: '1', name: 'Kuliah_Algoritma_StrukturData.pdf', size: '4.8 MB', isShared: false, shareLink: '' },
    { id: '2', name: 'Video_Demonstrasi_Proyek.mp4', size: '350 MB', isShared: true, shareLink: 'https://horizoncloud.my.id/shared/v-demo-99' },
    { id: '3', name: 'Slide_Presentasi_Final.pptx', size: '12.4 MB', isShared: false, shareLink: '' }
  ]);
  const [storageUsed, setStorageUsed] = useState(367.2); // MB
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Trigger marketing popup when storage limit exceeded
  useEffect(() => {
    if (storageUsed > 1024) {
      triggerDemoAlert(
        'Kapasitas Penyimpanan Penuh!',
        `Penyimpanan simulasi Anda telah mencapai ${storageUsed} MB (melebihi batas 1.0 GB paket Freemium). Silakan upgrade ke paket Premium Academic atau Premium Individual untuk memperluas penyimpanan hingga 15 GB!`
      );
    }
  }, [storageUsed]);

  // --- INTERACTIVE DEMO HANDLERS ---
  const startMigrationDemo = () => {
    if (migrationChecked.length === 0) {
      triggerDemoAlert(
        'Pilih Berkas Terlebih Dahulu',
        'Silakan centang setidaknya satu berkas di sebelah kiri sebelum memulai migrasi batch server-to-server.'
      );
      return;
    }
    if (migrationStatus === 'running') return;
    setMigrationStatus('running');
    setMigrationProgress(0);
    setMigrationSpeed('85 MB/s');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) progress = 100;
      setMigrationProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setMigrationStatus('done');
        setMigrationSpeed('0 MB/s');
      }
    }, 250);
  };

  const resetMigrationDemo = () => {
    setMigrationStatus('idle');
    setMigrationProgress(0);
    setMigrationSpeed('0 MB/s');
  };

  const sendAiMessage = (text: string) => {
    if (!text.trim() || aiIsTyping) return;
    
    setAiChatMessages(prev => [...prev, { sender: 'user', text }]);
    setAiIsTyping(true);
    
    setTimeout(() => {
      setAiIsTyping(false);
      let aiReply = "Sebagai demo asisten AI Horizon Cloud, saya dapat menganalisis dan menjawab pertanyaan spesifik dari berkas referensi Anda. Coba klik pertanyaan siap-pakai di bawah!";
      
      const lower = text.toLowerCase();
      if (lower.includes('kesimpulan') || lower.includes('summary') || lower.includes('rangkum')) {
        aiReply = "Berdasarkan dokumen Laporan_Kinerja_Q4.pdf, kesimpulan utamanya adalah Horizon Cloud berhasil memangkas latensi transfer data server-to-server sebesar 78%, menghemat kuota internet pengguna hingga 100%, serta memproses ringkasan dokumen 3x lebih cepat melalui caching model Gemini.";
      } else if (lower.includes('metodologi') || lower.includes('cara') || lower.includes('sistem')) {
         aiReply = "Metodologi evaluasi sistem Horizon Cloud meliputi pengujian throughput migrasi data, analisis token rate-limiting, isolasi folder pengguna pada database R2DBC, serta enkripsi SSL/TLS transit end-to-end.";
      } else if (lower.includes('harga') || lower.includes('biaya') || lower.includes('paket')) {
         aiReply = "Horizon Cloud menawarkan 3 paket: Freemium (Gratis, 2 Workspaces, 1 GB Storage VPS), Academic (Rp 15.000/bln, 15 Workspaces, 10 GB Storage), dan Premium Individual (Rp 20.000/bln, Unlimited Workspaces, 15 GB Storage).";
      }
      
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 1000);
  };

  const deleteStorageFile = (id: string) => {
    const fileToDelete = storageFiles.find(f => f.id === id);
    if (!fileToDelete) return;
    setStorageFiles(prev => prev.filter(f => f.id !== id));
    let sizeInMb = 0;
    if (fileToDelete.size.includes('MB')) {
      sizeInMb = parseFloat(fileToDelete.size);
    } else if (fileToDelete.size.includes('KB')) {
      sizeInMb = parseFloat(fileToDelete.size) / 1024;
    }
    setStorageUsed(prev => Math.max(0, parseFloat((prev - sizeInMb).toFixed(1))));
  };

  const toggleShareStorageFile = (id: string) => {
    setStorageFiles(prev => prev.map(f => {
      if (f.id === id) {
        const newShared = !f.isShared;
        return {
          ...f,
          isShared: newShared,
          shareLink: newShared ? `https://horizoncloud.my.id/shared/h-file-${f.id}-${Math.floor(Math.random() * 1000)}` : ''
        };
      }
      return f;
    }));
  };

  const copyStorageLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const addMockStorageFile = () => {
    const names = ['Foto_Angkatan_2025.jpg', 'Project_RPL_Fix.zip', 'Tugas_Database_Lanjut.docx', 'Curriculum_Vitae.pdf'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomSizeMb = Math.floor(Math.random() * 80) + 5;
    const newId = String(Date.now());
    const newFile = {
      id: newId,
      name: `${newId.substring(8)}_${randomName}`,
      size: `${randomSizeMb} MB`,
      isShared: false,
      shareLink: ''
    };
    setStorageFiles(prev => [...prev, newFile]);
    setStorageUsed(prev => parseFloat((prev + randomSizeMb).toFixed(1)));
  };

  // Pricing calculator state (workspaces count)
  const [workspacesCount, setWorkspacesCount] = useState<number>(2);

  // Bug report modal states
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugDescription, setBugDescription] = useState('');
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [isBugSubmitted, setIsBugSubmitted] = useState(false);
  const [bugError, setBugError] = useState('');
  const [bugRemainingAttempts, setBugRemainingAttempts] = useState<number | null>(null);
  const [bugLockoutTime, setBugLockoutTime] = useState<number>(() => {
    const saved = localStorage.getItem('lockout_report');
    if (!saved) return 0;
    const expiresAt = Number(saved);
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    if (bugLockoutTime <= 0) {
      localStorage.removeItem('lockout_report');
      return;
    }
    const timer = setInterval(() => {
      setBugLockoutTime(prev => {
        const next = prev - 1;
        if (next <= 0) {
          localStorage.removeItem('lockout_report');
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [bugLockoutTime]);

  const formatBugTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBugError('');
    if (bugDescription.trim().length < 5 || bugLockoutTime > 0) return;
    setIsSubmittingBug(true);
    try {
      await submitBugReport(bugDescription);
      setIsSubmittingBug(false);
      setIsBugSubmitted(true);
      setBugRemainingAttempts(null);
      localStorage.removeItem('lockout_report');
      setTimeout(() => {
        setIsBugModalOpen(false);
        setIsBugSubmitted(false);
        setBugDescription('');
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setIsSubmittingBug(false);

      const headers = err.response?.headers;
      if (headers) {
        const remaining = headers['x-ratelimit-remaining'];
        if (remaining !== undefined) {
          setBugRemainingAttempts(Number(remaining));
        }

        if (err.response?.status === 429) {
          const reset = headers['x-ratelimit-reset'] || headers['retry-after'];
          const resetTime = reset ? Number(reset) : 3600;
          setBugLockoutTime(resetTime);
          localStorage.setItem('lockout_report', String(Date.now() + resetTime * 1000));
        }
      }

      setBugError(
        err.response?.data?.message || 
        'Gagal mengirimkan laporan bug. Silakan coba lagi.'
      );
    }
  };

  const faqs = [
    {
      q: "Apakah migrasi data menggunakan kuota internet lokal saya?",
      a: "Tidak sama sekali. Proses migrasi file ditangani sepenuhnya secara server-to-server langsung di latar belakang antara VPS Storage Node dan server Google Drive. Kuota data internet Anda tidak akan terpotong untuk transfer file tersebut."
    },
    {
      q: "Bagaimana keamanan berkas dan data pribadi saya terjamin?",
      a: "Keamanan Anda adalah prioritas kami. Semua file Anda disimpan secara terisolasi di dalam VPS Storage Node pribadi Anda. Kami juga menggunakan protokol HTTPS terenkripsi penuh dan OAuth 2.0 resmi dari Google untuk menghubungkan Drive secara aman tanpa mengetahui kata sandi akun Google Anda."
    },
    {
      q: "Bagaimana fitur AI menganalisis dokumen saya?",
      a: "Aplikasi kami mengintegrasikan model AI canggih (Gemini/Groq/Qwen) secara aman. AI akan memproses konten dokumen teks atau PDF Anda untuk membuat ringkasan instan dan melayani chat interaktif. Riwayat chat Anda bersifat pribadi dan tidak digunakan untuk melatih model kecerdasan buatan umum."
    },
    {
      q: "Apakah layanan Horizon Cloud ini berbayar?",
      a: "Horizon Cloud menyediakan akun gratis (Freemium) untuk semua pendaftar baru yang mencakup 2 Workspaces, kuota penyimpanan Storage Node sebesar 1 GB, integrasi Google Drive, batas harian AI, serta sistem migrasi batch. Kami juga menawarkan paket Premium Individual dan Academic dengan kuota lebih besar."
    }
  ];

  // Helper function to decide which plan is recommended based on workspace count
  const getRecommendedPlan = (count: number): 'FREEMIUM' | 'ACADEMIC' | 'PREMIUM' => {
    if (count <= 2) return 'FREEMIUM';
    if (count <= 15) return 'ACADEMIC';
    return 'PREMIUM';
  };

  const recommendedPlan = getRecommendedPlan(workspacesCount);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-150/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-[#0053db] flex items-center justify-center shadow-md">
              <Cloud className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">Horizon Cloud</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">Multi Storage</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#fitur" id="nav-fitur" className="hover:text-primary transition-colors">Fitur Utama</a>
            <a href="#cara-kerja" id="nav-cara-kerja" className="hover:text-primary transition-colors">Cara Kerja</a>
            <a href="#harga" id="nav-harga" className="hover:text-primary transition-colors">Paket & Biaya</a>
            <a href="#faq" id="nav-faq" className="hover:text-primary transition-colors">FAQ</a>
            <a href="#lapor-bug" id="nav-lapor-bug" className="hover:text-primary transition-colors font-extrabold text-blue-600">Lapor Bug</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              to="/login" 
              id="nav-login-btn"
              className="hidden sm:inline-block px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              Masuk
            </Link>
            <Link 
              to="/register" 
              id="nav-register-btn"
              className="hidden sm:inline-block px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-[#003da3] rounded-xl shadow-[0_4px_15px_rgba(0,74,198,0.25)] hover:shadow-[0_6px_20px_rgba(0,74,198,0.35)] transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Daftar Sekarang
            </Link>
            
            {/* Hamburger Button for Mobile */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-650 hover:text-primary hover:bg-slate-100 transition-all border border-slate-205"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-b border-slate-150/80 shadow-lg animate-fadeIn flex flex-col p-6 space-y-6">
            <nav className="flex flex-col gap-4 font-bold text-slate-600">
              <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2.5 border-b border-slate-100/50">Fitur Utama</a>
              <a href="#cara-kerja" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2.5 border-b border-slate-100/50">Cara Kerja</a>
              <a href="#harga" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2.5 border-b border-slate-100/50">Paket & Biaya</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2.5 border-b border-slate-100/50">FAQ</a>
              <a href="#lapor-bug" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors py-2.5 text-blue-600 font-extrabold">Lapor Bug</a>
            </nav>
            <div className="flex flex-col gap-3 pt-2">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-full py-3 text-center text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/40"
              >
                Masuk
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-full py-3 text-center text-sm font-bold text-white bg-primary hover:bg-[#003da3] rounded-xl shadow-md transition-all"
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Layout */}
      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 px-6">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10 opacity-45 overflow-hidden">
            <div className="absolute -top-40 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-300/30 blur-[100px]" />
            <div className="absolute -top-30 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-300/30 blur-[80px]" />
          </div>

          <div className="w-full max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] px-2">
              Pindahkan File Raksasa & <br className="hidden sm:inline" />
              Kuasai Isi Dokumen Anda—<span className="bg-gradient-to-r from-primary to-[#0053db] bg-clip-text text-transparent">Instan Tanpa Menyedot Kuota!</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-semibold">
              Hubungkan Google Drive dengan Penyimpanan VPS Node personal Anda. Transfer berkas secepat kilat server-to-server, dan gunakan asisten kecerdasan buatan untuk berdiskusi dengan isi dokumen secara instan dan privat.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                id="hero-register-btn"
                aria-label="Mulai Daftar Akun Horizon Cloud Gratis"
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-[#003da3] text-white text-base font-bold rounded-2xl shadow-[0_8px_25px_rgba(0,74,198,0.3)] hover:shadow-[0_12px_30px_rgba(0,74,198,0.4)] transition-all hover:-translate-y-1 text-center cursor-pointer"
              >
                Mulai Secara Gratis
              </Link>
              <a
                href="#fitur"
                id="hero-learn-btn"
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-base font-bold rounded-2xl transition-all text-center cursor-pointer"
              >
                Pelajari Fitur
              </a>
            </div>

            {/* Interactive Showcase Mockup Section Tagline & Header */}
            <div className="pt-20 space-y-3 w-full max-w-3xl mx-auto">
              <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-black uppercase tracking-widest">
                Simulator Interaktif
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Coba Demo Fitur Horizon Cloud
              </h2>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                Visualisasikan kemudahan migrasi batch instan cloud-to-cloud (drive-to-drive), obrolan cerdas asisten AI dengan dokumen privat, serta manajemen file Storage Node lokal langsung di simulator bawah ini.
              </p>
            </div>

            {/* Interactive Showcase Mockup Section */}
            <div className="pt-8 w-full max-w-5xl mx-auto">
              <div className="bg-white p-4 rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,74,198,0.15)] border border-slate-200/80">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 sm:p-8 text-left space-y-6">
                  
                  {/* Mockup Window Header & Tabs */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow-sm" />
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shadow-sm" />
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
                      </div>
                      <div className="h-4 w-px bg-slate-200 mx-1" />
                      <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Demo Horizon Live</span>
                      </div>
                    </div>
                    
                    {/* Premium Segmented Controls for Mobile */}
                    <div className="w-full lg:hidden flex bg-slate-200/60 p-1.5 rounded-2xl gap-1.5 shadow-inner">
                      <button
                        onClick={() => setActiveShowcaseTab('migration')}
                        className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
                          activeShowcaseTab === 'migration'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        🔄 Migrasi
                      </button>
                      <button
                        onClick={() => setActiveShowcaseTab('ai')}
                        className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
                          activeShowcaseTab === 'ai'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        📄 AI Chat
                      </button>
                      <button
                        onClick={() => setActiveShowcaseTab('storage')}
                        className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
                          activeShowcaseTab === 'storage'
                            ? 'bg-white text-primary shadow-md'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        💾 Storage VPS
                      </button>
                    </div>

                    {/* Button Tabs on Desktop */}
                    <div className="hidden lg:flex bg-slate-200/80 p-1.5 rounded-2xl gap-1.5 shadow-inner">
                      <button
                        id="showcase-tab-migration"
                        onClick={() => setActiveShowcaseTab('migration')}
                        className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                          activeShowcaseTab === 'migration' 
                            ? 'bg-white text-primary shadow-md translate-y-0' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${activeShowcaseTab === 'migration' && migrationStatus === 'running' ? 'animate-spin' : ''}`} />
                        Migrasi Server-to-Server
                      </button>
                      <button
                        id="showcase-tab-ai"
                        onClick={() => setActiveShowcaseTab('ai')}
                        className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                          activeShowcaseTab === 'ai' 
                            ? 'bg-white text-primary shadow-md' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        AI Workspace
                      </button>
                      <button
                        id="showcase-tab-storage"
                        onClick={() => setActiveShowcaseTab('storage')}
                        className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                          activeShowcaseTab === 'storage' 
                            ? 'bg-white text-primary shadow-md' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Database className="w-3.5 h-3.5" />
                        Storage Node VPS
                      </button>
                    </div>
                  </div>

                  {/* Tab Content 1: Migrasi Server-to-Server */}
                  {activeShowcaseTab === 'migration' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Left Side: Source Explorer */}
                        <div className={`lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between h-auto lg:h-[480px] ${
                          migrationStatus !== 'idle' ? 'hidden lg:flex' : 'flex'
                        }`}>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Cloud className="w-4 h-4 text-primary" /> Pengelola File Multi-Cloud
                              </span>
                              <span className="text-[10px] bg-blue-50 text-primary border border-blue-100 font-extrabold px-2 py-0.5 rounded-full">
                                Terkoneksi API
                              </span>
                            </div>
                            
                            {/* Storage Provider Dropdowns */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sumber Data</span>
                                <select
                                  value={sourceProvider}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSourceProvider(val);
                                    if (val === targetProvider) {
                                      setTargetProvider(val === 'STORAGE_NODE' ? 'GOOGLE_DRIVE' : 'STORAGE_NODE');
                                    }
                                  }}
                                  disabled={migrationStatus === 'running'}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer disabled:opacity-60"
                                >
                                  <option value="GOOGLE_DRIVE">Google Drive</option>
                                  <option value="DROPBOX">Dropbox</option>
                                  <option value="ONEDRIVE">OneDrive</option>
                                  <option value="STORAGE_NODE">Storage VPS 1</option>
                                  <option value="STORAGE_NODE_2">Storage VPS 2</option>
                                </select>
                              </div>
                              <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tujuan Transfer</span>
                                <select
                                  value={targetProvider}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTargetProvider(val);
                                    if (val === sourceProvider) {
                                      setSourceProvider(val === 'GOOGLE_DRIVE' ? 'STORAGE_NODE' : 'GOOGLE_DRIVE');
                                    }
                                  }}
                                  disabled={migrationStatus === 'running'}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer disabled:opacity-60"
                                >
                                  <option value="STORAGE_NODE">Storage VPS 1</option>
                                  <option value="STORAGE_NODE_2">Storage VPS 2</option>
                                  <option value="GOOGLE_DRIVE">Google Drive</option>
                                  <option value="DROPBOX">Dropbox</option>
                                  <option value="ONEDRIVE">OneDrive</option>
                                </select>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                              Pilih file dari {sourceProvider === 'GOOGLE_DRIVE' ? 'Google Drive' : sourceProvider === 'DROPBOX' ? 'Dropbox' : 'OneDrive'} untuk ditransfer:
                            </p>

                            {/* Checklist of files */}
                            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
                              {migrationFiles.map((file, idx) => (
                                <label 
                                  key={idx}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                                    migrationChecked.includes(idx)
                                      ? 'border-primary bg-blue-50/20'
                                      : 'border-slate-150 hover:border-slate-250 bg-slate-50/50'
                                  } ${migrationStatus === 'running' ? 'pointer-events-none opacity-60' : ''}`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <input 
                                      type="checkbox"
                                      checked={migrationChecked.includes(idx)}
                                      onChange={() => {
                                        if (migrationChecked.includes(idx)) {
                                          setMigrationChecked(migrationChecked.filter(i => i !== idx));
                                        } else {
                                          setMigrationChecked([...migrationChecked, idx]);
                                        }
                                      }}
                                      disabled={migrationStatus === 'running'}
                                      className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-extrabold shrink-0 ml-2">{file.size}</span>
                                </label>
                              ))}
                            </div>

                            {/* Add Local File to Simulator */}
                            <div className="pt-2">
                              <label className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-[10px] font-black text-slate-500 hover:text-primary transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer">
                                <span>+ Tautkan Berkas Lokal (Simulasi)</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  disabled={migrationStatus === 'running'}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const newFile = {
                                        name: `📄 ${file.name}`,
                                        size: formatBytes(file.size)
                                      };
                                      setMigrationFiles(prev => [...prev, newFile]);
                                      setMigrationChecked(prev => [...prev, migrationFiles.length]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex gap-2">
                            {migrationStatus === 'idle' ? (
                              <button
                                onClick={startMigrationDemo}
                                disabled={migrationChecked.length === 0}
                                className="flex-1 py-3 bg-primary hover:bg-[#003da3] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl shadow-md shadow-primary/10 hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Mulai Migrasi Instant
                              </button>
                            ) : migrationStatus === 'running' ? (
                              <div className="flex-1 py-3 bg-blue-50 border border-blue-200 text-primary text-xs font-black rounded-xl text-center flex items-center justify-center gap-2 animate-pulse">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Mentransfer Batch ({migrationProgress}%)
                              </div>
                            ) : (
                              <button
                                onClick={resetMigrationDemo}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border border-slate-200 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                              >
                                Ulangi Simulasi Demo
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Real Batch Progress Dashboard Mockup */}
                        <div className={`lg:col-span-7 bg-white rounded-2xl border border-slate-150 p-5 flex flex-col justify-between shadow-sm h-auto lg:h-[480px] ${
                          migrationStatus === 'idle' ? 'hidden lg:flex' : 'flex'
                        }`}>
                          {migrationStatus === 'idle' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fadeIn">
                              <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200 shadow-inner">
                                <RefreshCw className="w-7 h-7" />
                              </div>
                              <div className="space-y-2 max-w-sm">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Dasbor Progress Migrasi</h4>
                                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                                  Pilih beberapa berkas di kiri, pilih penyedia cloud tujuan, kemudian klik tombol "Mulai Migrasi Instant" untuk mensimulasikan pemindahan sekuensial secara batch.
                                </p>
                              </div>
                              <div className="pt-2 flex flex-wrap justify-center gap-2 text-[10px] font-bold text-slate-500">
                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">Tanpa Bandwidth Lokal</span>
                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">Proses Background</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                              <div className="space-y-4">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                  <div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Progress Migrasi Batch</h4>
                                    <span className="text-[9px] text-slate-400 font-extrabold font-mono uppercase">Batch ID: BATCH-{sourceProvider.substring(0, 3)}-{targetProvider.substring(0, 3)}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      migrationStatus === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary animate-pulse'
                                    }`}>
                                      {migrationStatus === 'done' ? 'Selesai' : 'Berjalan'}
                                    </span>
                                  </div>
                                </div>

                                {/* Global progress info */}
                                <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl space-y-2">
                                  <div className="flex justify-between text-xs font-bold text-slate-600">
                                    <span>Progres Keseluruhan</span>
                                    <span className="text-primary font-black">{migrationProgress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-primary h-full rounded-full transition-all duration-300"
                                      style={{ width: `${migrationProgress}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-[9px] font-black text-slate-400">
                                    <span>Status: {migrationStatus === 'done' ? 'Semua berkas ditransfer' : 'Menyalin berkas...'}</span>
                                    <span>Kecepatan: {migrationStatus === 'done' ? '0 MB/s' : '85 MB/s'}</span>
                                  </div>
                                </div>

                                {/* File-by-file batch details list */}
                                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                  {migrationChecked.map((checkedIdx, i) => {
                                    const file = migrationFiles[checkedIdx];
                                    if (!file) return null;
                                    
                                    const N = migrationChecked.length;
                                    const startVal = i * (100 / N);
                                    const endVal = (i + 1) * (100 / N);
                                    
                                    let taskProgress = 0;
                                    let statusText = 'Antrean';
                                    let statusStyle = 'bg-slate-100 text-slate-500 border border-slate-200';
                                    
                                    if (migrationProgress >= endVal) {
                                      taskProgress = 100;
                                      statusText = 'Selesai';
                                      statusStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-200';
                                    } else if (migrationProgress < startVal) {
                                      taskProgress = 0;
                                      statusText = 'Antrean';
                                      statusStyle = 'bg-slate-100 text-slate-500 border border-slate-200';
                                    } else {
                                      taskProgress = Math.round(((migrationProgress - startVal) / (endVal - startVal)) * 100);
                                      statusText = 'Menyalin';
                                      statusStyle = 'bg-blue-50 text-primary border border-blue-200';
                                    }

                                    return (
                                      <div key={i} className="p-3 bg-white border border-slate-150 rounded-xl space-y-2 transition-all hover:border-slate-250">
                                        <div className="flex justify-between items-center gap-2">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                                            <span className="text-xs font-bold text-slate-700 truncate">{file.name.replace('📄 ', '')}</span>
                                          </div>
                                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${statusStyle}`}>
                                            {statusText}
                                          </span>
                                        </div>

                                        {/* Direction logic flow: cloud source -> cloud target */}
                                        <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold text-slate-400">
                                          <span className="flex items-center gap-1">
                                            {getProviderVisuals(sourceProvider).icon}
                                            {getProviderVisuals(sourceProvider).name}
                                          </span>
                                          <ArrowRight className="w-2.5 h-2.5 text-slate-350" />
                                          <span className="flex items-center gap-1">
                                            {getProviderVisuals(targetProvider).icon}
                                            {getProviderVisuals(targetProvider).name}
                                          </span>
                                          <span className="ml-auto font-mono">{file.size}</span>
                                        </div>

                                        {/* Individual file progress bar */}
                                        <div className="space-y-1">
                                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full transition-all duration-300 ${statusText === 'Selesai' ? 'bg-emerald-500' : 'bg-primary'}`}
                                              style={{ width: `${taskProgress}%` }}
                                            />
                                          </div>
                                          <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono">
                                            <span>Progres Berkas</span>
                                            <span>{taskProgress}%</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                                <span>Migrasi via Horizon Core Server</span>
                                <span className="font-mono">Hemat Kuota Lokal: 100%</span>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                  {/* Tab Content 2: AI Workspace */}
                  {activeShowcaseTab === 'ai' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
                      
                      {/* Left: Document Selection sidebar */}
                      <div className="hidden lg:flex lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between h-auto lg:h-[480px]">
                        <div className="space-y-4">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block pb-2 border-b border-slate-100">
                            Berkas Terkait Workspace
                          </span>
                          
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                            {aiWorkspaceFiles.map((doc, idx) => (
                              <button
                                key={idx}
                                onClick={() => setAiSelectedDoc(doc.name)}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                                  aiSelectedDoc === doc.name
                                    ? 'border-primary bg-blue-50/10'
                                    : 'border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                <FileText className={`w-8 h-8 shrink-0 ${aiSelectedDoc === doc.name ? 'text-primary' : 'text-slate-400'}`} />
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-black text-slate-800 truncate">{doc.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-semibold">{doc.size} • {doc.type}</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Estimasi Grounding Token:</span>
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>7,842 Token Terpakai</span>
                              <span>Limit: 20,000</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: '39%' }} />
                            </div>
                          </div>
                        </div>

                        <label className="w-full mt-4 py-2.5 border border-dashed border-slate-300 hover:border-primary hover:bg-slate-50 text-[11px] font-black text-slate-500 hover:text-primary rounded-xl transition-all text-center cursor-pointer block">
                          <span>+ Tautkan File Lainnya</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const newFile = {
                                  name: file.name,
                                  size: formatBytes(file.size),
                                  type: file.type.includes('pdf') ? 'PDF Ringkasan' : 'Dokumen Kustom'
                                };
                                setAiWorkspaceFiles(prev => [...prev, newFile]);
                                setAiSelectedDoc(file.name);
                                setAiChatMessages(prev => [
                                  ...prev,
                                  { sender: 'user', text: `Tautkan berkas: ${file.name} (${newFile.size})` },
                                  { sender: 'ai', text: `Halo! Berkas "${file.name}" berhasil diunggah secara lokal di memori browser. Saya siap memproses ringkasan atau melayani pertanyaan Anda mengenai berkas ini secara terisolasi.` }
                                ]);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Center: Scrollable Chat Panel */}
                      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex flex-col justify-between h-[450px] lg:h-[480px]">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
                          <span className="text-xs font-black text-slate-800 truncate max-w-[250px] sm:max-w-md">
                            Diskusi Aktif: <span className="text-primary font-bold">{aiSelectedDoc}</span>
                          </span>
                          <button 
                            onClick={() => setAiChatMessages([{ sender: 'ai', text: 'Riwayat obrolan dibersihkan.' }])}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                          >
                            Bersihkan Chat
                          </button>
                        </div>

                        {/* Mobile Document Picker (Horizontal Pills at the top of the Chat Panel) */}
                        <div className="lg:hidden py-2.5 border-b border-slate-100 flex flex-col gap-1.5 shrink-0">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Pilih Dokumen Grounding:
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {aiWorkspaceFiles.map((doc, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setAiSelectedDoc(doc.name);
                                  setAiChatMessages(prev => [
                                    ...prev,
                                    { sender: 'ai', text: `Menghubungkan AI ke berkas: "${doc.name}"` }
                                  ]);
                                }}
                                type="button"
                                className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                  aiSelectedDoc === doc.name
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-slate-200 bg-white text-slate-650 hover:border-slate-350'
                                }`}
                              >
                                <FileText className="w-3 h-3" />
                                {doc.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs leading-relaxed custom-scrollbar">
                          {aiChatMessages.map((msg, idx) => (
                            <div 
                              key={idx} 
                              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                              <div className={`p-3 rounded-2xl max-w-[85%] font-semibold shadow-sm ${
                                msg.sender === 'user'
                                  ? 'bg-primary text-white rounded-tr-none'
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                              }`}>
                                {msg.sender === 'ai' && (
                                  <span className="text-[9px] font-black text-primary block uppercase tracking-wider mb-1">Horizon AI Assistant</span>
                                )}
                                <p>{msg.text}</p>
                              </div>
                            </div>
                          ))}
                          
                          {aiIsTyping && (
                            <div className="flex flex-col items-start animate-pulse">
                              <div className="bg-slate-100 border border-slate-200/50 p-3 rounded-2xl rounded-tl-none text-slate-500 font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                                <span>Horizon AI sedang membaca...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive Suggestion Triggers */}
                        <div className="shrink-0 pb-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Pertanyaan Rekomendasi:</span>
                          <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                            <button
                              onClick={() => sendAiMessage("Tolong buat kesimpulan utama dokumen ini.")}
                              disabled={aiIsTyping}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 text-[10px] font-extrabold rounded-lg whitespace-nowrap transition-all cursor-pointer"
                            >
                              💡 Rangkum Dokumen
                            </button>
                            <button
                              onClick={() => sendAiMessage("Metodologi apa yang digunakan dalam analisis?")}
                              disabled={aiIsTyping}
                              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 text-[10px] font-extrabold rounded-lg whitespace-nowrap transition-all cursor-pointer"
                            >
                              💡 Tanya Metodologi
                            </button>
                            <button
                              onClick={() => sendAiMessage("Berapa saja paket harga langganan Horizon Cloud?")}
                              disabled={aiIsTyping}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 text-[10px] font-extrabold rounded-lg whitespace-nowrap transition-all cursor-pointer"
                            >
                              💡 Detail Paket Harga
                            </button>
                          </div>
                        </div>

                        {/* Input Area */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            sendAiMessage(aiCustomInput);
                            setAiCustomInput('');
                          }}
                          className="flex gap-2 shrink-0 border-t border-slate-100 pt-3"
                        >
                          <input
                            type="text"
                            value={aiCustomInput}
                            onChange={(e) => setAiCustomInput(e.target.value)}
                            disabled={aiIsTyping}
                            placeholder="Ketik pertanyaan kustom tentang dokumen..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-70"
                          />
                          <button 
                            type="submit"
                            disabled={!aiCustomInput.trim() || aiIsTyping}
                            className="bg-primary hover:bg-[#003da3] disabled:bg-slate-150 disabled:text-slate-400 text-white p-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>

                    </div>
                  )}

                  {/* Tab Content 3: Storage Node VPS */}
                  {activeShowcaseTab === 'storage' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
                      
                      {/* Left: Storage Gauge */}
                      <div className="hidden lg:flex lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between h-auto lg:h-[480px]">
                        <div className="space-y-4">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block pb-2 border-b border-slate-100">
                            Storage Node status
                          </span>
                          
                          <div className="text-center py-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                            <span className="text-3xl font-black text-slate-800 tracking-tight">{storageUsed} MB</span>
                            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Kapasitas Node Terpakai</span>
                            
                            <div className="px-6 space-y-2 pt-2">
                              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-purple-600 h-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, (storageUsed / 1024) * 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                <span>0 GB</span>
                                <span>Limit: 1.0 GB</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                            Menghapus file di samping kanan akan mengurangi meteran penyimpanan personal secara otomatis.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={addMockStorageFile}
                            className="w-full py-2.5 bg-primary hover:bg-[#003da3] text-white text-xs font-black rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                          >
                            + Tambah Berkas                          </button>
                          <label className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer block">
                            <span>+ Unggah Berkas Lokal</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const newFile = {
                                    id: String(Date.now()),
                                    name: file.name,
                                    size: formatBytes(file.size),
                                    isShared: false,
                                    shareLink: ''
                                  };
                                  setStorageFiles(prev => [...prev, newFile]);
                                  const sizeMb = file.size / (1024 * 1024);
                                  setStorageUsed(prev => parseFloat((prev + sizeMb).toFixed(1)));
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Right: File Explorer Table */}
                      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex flex-col justify-between h-auto lg:h-[480px] overflow-hidden">
                        <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest block pb-2 border-b border-slate-100">
                            File Manager: /Penyimpanan-Horizon
                          </span>

                          {/* Mobile Storage Header Gauge */}
                          <div className="lg:hidden bg-slate-50 border border-slate-150 p-3.5 rounded-2xl space-y-2.5 my-3">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-1.5 text-[9px] uppercase font-black text-slate-400">
                                <Database className="w-3.5 h-3.5 text-purple-600" /> Kapasitas Node
                              </span>
                              <span className="font-extrabold text-[11px] text-purple-600">{storageUsed} MB / 1.0 GB</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-purple-600 h-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (storageUsed / 1024) * 100)}%` }}
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={addMockStorageFile}
                                type="button"
                                className="flex-1 py-2 bg-primary hover:bg-[#003da3] text-white text-[10px] font-black rounded-lg shadow-sm text-center cursor-pointer"
                              >
                                + Simulasi Berkas
                              </button>
                              <label className="flex-1 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black rounded-lg shadow-sm text-center cursor-pointer block">
                                <span>+ Upload Lokal</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const newFile = {
                                        id: String(Date.now()),
                                        name: file.name,
                                        size: formatBytes(file.size),
                                        isShared: false,
                                        shareLink: ''
                                      };
                                      setStorageFiles(prev => [...prev, newFile]);
                                      const sizeMb = file.size / (1024 * 1024);
                                      setStorageUsed(prev => parseFloat((prev + sizeMb).toFixed(1)));
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          
                          {storageFiles.length === 0 ? (
                            <div className="py-12 text-center space-y-2 animate-fadeIn">
                              <p className="text-xs text-slate-400 font-bold">Direktori ini kosong.</p>
                              <button 
                                onClick={addMockStorageFile}
                                className="text-[10px] text-primary font-black underline cursor-pointer"
                              >
                                Tambah Berkas Sekarang
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {storageFiles.map((file) => (
                                <div 
                                  key={file.id} 
                                  className="flex flex-col p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2 transition-all hover:bg-slate-100/50 animate-fadeIn"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <FileText className="w-4 h-4 text-primary shrink-0" />
                                      <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="text-[10px] text-slate-400 font-extrabold">{file.size}</span>
                                      <button 
                                        onClick={() => deleteStorageFile(file.id)}
                                        className="text-[10px] font-black text-rose-500 hover:text-rose-700 cursor-pointer"
                                      >
                                        Hapus
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 text-[10px] font-bold flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400">Status Berbagi:</span>
                                      <button
                                        onClick={() => toggleShareStorageFile(file.id)}
                                        className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                                          file.isShared
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}
                                      >
                                        {file.isShared ? 'Publik' : 'Privat'}
                                      </button>
                                    </div>

                                    {file.isShared && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-primary truncate max-w-[120px] sm:max-w-[180px] font-mono">{file.shareLink}</span>
                                        <button
                                          onClick={() => copyStorageLink(file.id, file.shareLink)}
                                          className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                                        >
                                          {copiedLinkId === file.id ? 'Tersalin!' : 'Salin'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="py-20 md:py-28 bg-white border-y border-slate-100 px-6">
          <div className="w-full max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                Fitur Unggulan
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Pindahkan & Pahami File Anda dengan Mudah
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed">
                Kami menggabungkan infrastruktur server penyimpanan yang cepat dan asisten AI pintar dalam satu ekosistem terpadu.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {/* Feature 1 */}
              <div className="group bg-slate-50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-2 sm:mb-3">Pindahkan File Tanpa Kuota, Tanpa Menunggu</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-semibold">
                  Transfer data berukuran giga-byte secara instan dari Google Drive langsung ke server VPS Storage Node Anda. Proses selesai otomatis di server tanpa menghabiskan kuota internet ponsel Anda.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-slate-50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-2 sm:mb-3">Asisten Pintar yang Membaca untuk Anda</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-semibold">
                  Unggah file PDF materi kuliah, laporan kerja, atau skripsi. Gunakan asisten AI Horizon untuk memindai dokumen, merangkum poin-poin utama, dan melakukan tanya-jawab secara langsung.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-slate-50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-2 sm:mb-3">Berbagi Cepat & Terkontrol</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-semibold">
                  Dapatkan tautan berbagi publik yang dienkripsi secara penuh dengan proteksi batas waktu kedaluwarsa otomatis. Berbagi file besar ke rekan tim menjadi aman dan terkendali.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-slate-50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-2 sm:mb-3">Brankas File Berkecepatan Tinggi Anda</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-semibold">
                  Peroleh penyimpanan data cloud personal di server VPS Storage Node khusus. Kecepatan download-upload maksimal, aman terisolasi secara privat, dan bebas dari pelacakan eksternal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="cara-kerja" className="py-20 md:py-28 px-6">
          <div className="w-full max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-xl mx-auto">
              <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                Langkah Mudah
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Cara Kerja Horizon Cloud
              </h2>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                Hanya butuh tiga langkah praktis untuk mengintegrasikan dan menguasai seluruh penyimpanan data Anda.
              </p>
            </div>

            {/* Steps List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 relative">
              {/* Step 1 */}
              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">Hubungkan Google Drive</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
                  Masuk ke platform kami, kemudian hubungkan akun Google Drive Anda menggunakan integrasi resmi Google OAuth 2.0 yang aman.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pilih Berkas yang Ingin Dipindah</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
                  Lihat seluruh struktur berkas Google Drive dan VPS Storage Node personal Anda secara real-time dari satu halaman terpadu.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">Kirim Perintah Migrasi atau Gunakan AI</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
                  Klik tombol migrasi file server-to-server secara background, atau unggah dokumen untuk diringkas dan didiskusikan dengan AI.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Calculator & Subscription Pricing Section */}
        <section id="harga" className="py-20 md:py-28 bg-white border-t border-slate-100 px-6">
          <div className="w-full max-w-7xl mx-auto space-y-16">
            
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                Skema Biaya & Kapasitas
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Pilih Paket Terbaik Sesuai Kebutuhan Anda
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed">
                Gunakan asisten kalkulator kami di bawah untuk menentukan jumlah dokumen dan workspace yang Anda butuhkan, kemudian biarkan kami merekomendasikan paket yang tepat untuk Anda.
              </p>
            </div>

            {/* Interactive Calculator Slider Widget */}
            <div className="w-full max-w-xl mx-auto bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-primary" />
                  Kalkulator Kebutuhan Workspace
                </span>
                <span className="text-xs font-extrabold px-3 py-1 bg-primary/10 text-primary rounded-full">
                  {workspacesCount} Workspace
                </span>
              </div>
              
              <div className="space-y-4">
                <input
                  type="range"
                  id="pricing-storage-slider"
                  min="1"
                  max="30"
                  value={workspacesCount}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    setWorkspacesCount(count);
                    const plan = getRecommendedPlan(count);
                    setActivePricingTab(plan.toLowerCase() as 'freemium' | 'academic' | 'premium');
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>1 Workspace</span>
                  <span>15 Workspace</span>
                  <span>30+ Workspace</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Rekomendasi Paket Langganan:</span>
                  <span className="text-sm font-black text-slate-800">
                    {recommendedPlan === 'FREEMIUM' && 'Freemium (Gratis Selamanya)'}
                    {recommendedPlan === 'ACADEMIC' && 'Premium Academic (Rp 15.000 / bulan)'}
                    {recommendedPlan === 'PREMIUM' && 'Premium Individual (Rp 20.000 / bulan)'}
                  </span>
                </div>
                <a
                  href="#harga-cards"
                  className="px-5 py-2.5 bg-primary hover:bg-[#003da3] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/10"
                >
                  Lihat Detail Paket
                </a>
              </div>
            </div>

            {/* Tab Selector on Mobile */}
            <div className="flex md:hidden bg-slate-100 p-1 rounded-2xl mb-6 max-w-xs mx-auto border border-slate-200/60">
              <button 
                onClick={() => {
                  setActivePricingTab('freemium');
                  setWorkspacesCount(2);
                }} 
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activePricingTab === 'freemium' 
                    ? 'bg-white text-primary shadow-sm font-black' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Freemium
              </button>
              <button 
                onClick={() => {
                  setActivePricingTab('academic');
                  setWorkspacesCount(10);
                }} 
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activePricingTab === 'academic' 
                    ? 'bg-white text-primary shadow-sm font-black' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Academic
              </button>
              <button 
                onClick={() => {
                  setActivePricingTab('premium');
                  setWorkspacesCount(20);
                }} 
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activePricingTab === 'premium' 
                    ? 'bg-white text-primary shadow-md font-black' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Premium
              </button>
            </div>

            {/* Pricing Cards List */}
            <div id="harga-cards" className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 items-stretch">
              
              {/* Card 1: Freemium */}
              <div className={`bg-white border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                recommendedPlan === 'FREEMIUM'
                  ? 'border-primary ring-4 ring-primary/10 shadow-xl lg:scale-[1.03] md:-translate-y-2'
                  : 'border-slate-200 hover:border-slate-350 hover:shadow-md'
              } ${activePricingTab === 'freemium' ? 'flex' : 'hidden md:flex'}`}>
                {recommendedPlan === 'FREEMIUM' && (
                  <span className="absolute -top-3 left-8 px-3.5 py-1 rounded-full text-[10px] font-black bg-primary text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Rekomendasi
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Akun Pemula</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Freemium</h3>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Gratis</span>
                      <span className="text-xs text-slate-400 font-bold">/ selamanya</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-bold leading-relaxed border-t border-slate-100 pt-4">
                    Cocok untuk mencoba fitur migrasi file server-to-server Horizon dan mencoba asisten ringkasan AI dasar.
                  </p>

                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>2 Workspaces Terintegrasi</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>20,000 Input Token AI</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>1 GB Penyimpanan VPS Storage</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>5 Permintaan AI / hari</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>3 Migrasi / hari (Max 256MB/file)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-400 line-through">
                      <span className="text-rose-500 font-extrabold shrink-0">✗</span>
                      <span>Kapasitas File Migrasi Skala GB</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-400 line-through">
                      <span className="text-rose-500 font-extrabold shrink-0">✗</span>
                      <span>Lebih dari 1 Akun Cloud Eksternal</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/register"
                    id="pricing-btn-freemium"
                    className="block w-full py-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all"
                  >
                    Mulai Akun Gratis
                  </Link>
                </div>
              </div>

              {/* Card 2: Academic */}
              <div className={`bg-white border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                recommendedPlan === 'ACADEMIC'
                  ? 'border-primary ring-4 ring-primary/10 shadow-xl lg:scale-[1.03] md:-translate-y-2'
                  : 'border-slate-200 hover:border-slate-350 hover:shadow-md'
              } ${activePricingTab === 'academic' ? 'flex' : 'hidden md:flex'}`}>
                {recommendedPlan === 'ACADEMIC' && (
                  <span className="absolute -top-3 left-8 px-3.5 py-1 rounded-full text-[10px] font-black bg-primary text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Rekomendasi
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary uppercase tracking-widest">Klaim Mahasiswa</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-50 text-primary border border-blue-200 uppercase tracking-wide">Hemat 40%</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Premium Academic</h3>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Rp 15.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ bulan</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-1">Harga normal: Rp 25.000</span>
                  </div>

                  <p className="text-xs text-slate-400 font-bold leading-relaxed border-t border-slate-100 pt-4">
                    Dirancang untuk memfasilitasi kebutuhan akademik dan manajemen tugas kuliah mahasiswa (wajib verifikasi email kampus).
                  </p>

                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>15 Workspaces Terintegrasi</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>75,000 Input Token AI</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>10 GB Penyimpanan VPS Storage</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>30 Permintaan AI / hari</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>30 Migrasi / hari (Max 10GB/file)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>Hubungkan Hingga 5 Akun Cloud</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-400 line-through">
                      <span className="text-rose-500 font-extrabold shrink-0">✗</span>
                      <span>Migrasi Berkas Tanpa Batasan Ukuran</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/register"
                    id="pricing-btn-academic"
                    className="block w-full py-3 text-center bg-primary hover:bg-[#003da3] text-white text-xs font-black rounded-xl transition-all shadow-md shadow-primary/10"
                  >
                    Daftar Sebagai Mahasiswa
                  </Link>
                </div>
              </div>

              {/* Card 3: Premium Individual */}
              <div className={`bg-white border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                recommendedPlan === 'PREMIUM'
                  ? 'border-primary ring-4 ring-primary/10 shadow-xl lg:scale-[1.03] md:-translate-y-2'
                  : 'border-slate-200 hover:border-slate-350 hover:shadow-md'
              } ${activePricingTab === 'premium' ? 'flex' : 'hidden md:flex'}`}>
                {recommendedPlan === 'PREMIUM' && (
                  <span className="absolute -top-3 left-8 px-3.5 py-1 rounded-full text-[10px] font-black bg-primary text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Rekomendasi
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-650 uppercase tracking-widest">Kapasitas Maksimal</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wide">Hemat 33%</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Premium Individual</h3>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Rp 20.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ bulan</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-1">Harga normal: Rp 30.000</span>
                  </div>

                  <p className="text-xs text-slate-400 font-bold leading-relaxed border-t border-slate-100 pt-4">
                    Paket lengkap tanpa batasan. Cocok untuk profesional yang mengelola ratusan berkas besar setiap harinya.
                  </p>

                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>Workspace Tanpa Batas</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>150.000 Token AI (Input & Ringkasan)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>15 GB Penyimpanan VPS Storage</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>50 Permintaan AI / hari</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>Migrasi Berkas Tanpa Batas (Ukuran bebas)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>Hubungkan Hingga 10 Akun Cloud</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                      <span className="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span>Dukungan Teknis Prioritas</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/register"
                    id="pricing-btn-premium"
                    className="block w-full py-3 text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-slate-900/10"
                  >
                    Dapatkan Premium Individual
                  </Link>
                </div>
              </div>

            </div>

            {/* Security Guarantee Box */}
            <div className="w-full max-w-4xl mx-auto bg-blue-50/60 border border-blue-200/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-white border border-blue-200 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-sm font-black text-slate-900">Keamanan Tingkat Profesional Terjamin</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Kami menggunakan Google OAuth resmi (akses aman tanpa mengetahui password akun Anda). Seluruh pengiriman data dilindungi koneksi HTTPS yang aman dan terenkripsi secara penuh. Kami tidak akan pernah menyalin atau menjual isi berkas Anda.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28 bg-[#F8FAFC] border-t border-slate-100 px-6">
          <div className="w-full max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                Tanya Jawab
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-sm text-slate-500 font-semibold">
                Temukan seluruh jawaban mengenai kuota, migrasi data, dan asisten AI Horizon Cloud.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-2xl border border-slate-150 overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    id={`faq-btn-${i}`}
                    onClick={() => toggleFaq(i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      openFaq === i ? 'max-h-[300px] border-t border-slate-150/60' : 'max-h-0'
                    } overflow-hidden`}
                  >
                    <p className="px-6 py-5 text-xs text-slate-500 font-semibold leading-relaxed bg-slate-50/50">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bug Report Section (Dark Mode Premium Aesthetics) */}
        <section id="lapor-bug" className="py-24 bg-slate-950 text-white relative overflow-hidden px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[300px] pointer-events-none -z-10 opacity-30">
            <div className="absolute top-0 left-1/4 w-[250px] h-[250px] rounded-full bg-blue-500/20 blur-[80px]" />
          </div>

          <div className="w-full max-w-3xl mx-auto text-center space-y-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-primary flex items-center justify-center mx-auto shadow-md border border-white/10">
              <MessageSquareWarning className="w-6 h-6 text-white" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Menemukan Kendala atau Bug di Aplikasi?
              </h2>
              <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-semibold leading-relaxed">
                Kami berkomitmen menjaga performa platform tetap stabil. Laporkan setiap kendala atau bug sistem agar tim pengembang kami bisa melakukan perbaikan secepatnya.
              </p>
            </div>

            <button
              id="bug-report-trigger-btn"
              onClick={() => setIsBugModalOpen(true)}
              className="px-8 py-3.5 bg-primary hover:bg-[#003da3] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border border-transparent"
            >
              Laporkan Kendala Sekarang
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Cloud className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight text-sm">Horizon Cloud</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <Link 
                to="/privacy-policy"
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </Link>
              <span className="text-slate-700">|</span>
              <Link 
                to="/term-of-service"
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </Link>
            </div>
            <span className="hidden md:inline text-slate-700">|</span>
            <p className="text-slate-500">
              &copy; 2025 EmuyForge Team. Seluruh hak cipta dilindungi undang-undang.
            </p>
          </div>
        </div>
      </footer>


      {/* Embedded Bug Report Modal */}
      {isBugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setIsBugModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden animate-scaleUp z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-[#0053db] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquareWarning className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm">Laporkan Masalah / Bug</span>
              </div>
              <button 
                id="bug-close-modal-btn"
                onClick={() => setIsBugModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 text-slate-800">
              {isBugSubmitted ? (
                <div className="flex flex-col items-center py-6 gap-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-800 text-sm">Laporan Terkirim!</p>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-semibold">
                      Terima kasih atas kontribusi Anda. Tim developer kami akan segera menindaklanjuti kendala ini.
                    </p>
                  </div>
                </div>
              ) : (
                <form id="bug-report-form" onSubmit={handleBugSubmit} className="space-y-5" noValidate>
                  {bugLockoutTime > 0 && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/50 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
                      <span>Terlalu banyak mengirim laporan. Coba lagi dalam {formatBugTime(bugLockoutTime)}.</span>
                    </div>
                  )}

                  {bugError && bugLockoutTime <= 0 && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/50 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                      <span>{bugError}</span>
                    </div>
                  )}

                  {bugRemainingAttempts !== null && bugRemainingAttempts > 0 && bugRemainingAttempts <= 2 && bugLockoutTime <= 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50 flex items-center gap-2 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span>Tersisa {bugRemainingAttempts} kali pengiriman laporan lagi.</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Deskripsi Kendala / Masukan
                    </label>
                    <textarea
                      id="bug-description-textarea"
                      rows={5}
                      value={bugDescription}
                      onChange={(e) => setBugDescription(e.target.value)}
                      placeholder="Jelaskan secara singkat kendala yang Anda alami, langkah terjadinya, atau saran fitur..."
                      disabled={isSubmittingBug || bugLockoutTime > 0}
                      className="w-full resize-none border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-relaxed disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                    <p className={`text-[10px] font-semibold text-right ${
                      bugDescription.length > 0 && bugDescription.length < 5 ? 'text-rose-500 font-bold' : 'text-slate-350'
                    }`}>
                      {bugDescription.length} / 500 (Min. 5 karakter)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id="bug-cancel-btn"
                      type="button"
                      onClick={() => setIsBugModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      id="bug-submit-btn"
                      type="submit"
                      disabled={bugDescription.trim().length < 5 || isSubmittingBug || bugLockoutTime > 0}
                      className={`flex-[2] px-4 py-2.5 text-white text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer ${
                        bugDescription.trim().length >= 5 && !isSubmittingBug && bugLockoutTime <= 0
                          ? 'bg-primary hover:bg-[#003da3] shadow-md shadow-primary/10'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isSubmittingBug ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Mengirim...</span>
                        </>
                      ) : bugLockoutTime > 0 ? (
                        <span>Terkunci ({formatBugTime(bugLockoutTime)})</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Laporan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal for Demo Interactions */}
      {showDemoAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setShowDemoAlert(false)}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity" 
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-scaleUp z-10 p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary border border-blue-100 shadow-sm flex items-center justify-center mx-auto">
              <MessageSquareWarning className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-800">{demoAlertTitle}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {demoAlertMessage}
              </p>
            </div>

            <button
              onClick={() => setShowDemoAlert(false)}
              className="w-full py-3 bg-primary hover:bg-[#003da3] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
