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
  Sliders
} from 'lucide-react';
import { submitBugReport } from '../../api/reports';

export default function LandingPage() {
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
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-primary/20 selection:text-primary">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-150/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              id="nav-login-btn"
              className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              Masuk
            </Link>
            <Link 
              to="/register" 
              id="nav-register-btn"
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-[#003da3] rounded-xl shadow-[0_4px_15px_rgba(0,74,198,0.25)] hover:shadow-[0_6px_20px_rgba(0,74,198,0.35)] transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
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

          <div className="max-w-5xl mx-auto text-center space-y-8">
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

            {/* Interactive Showcase Mockup Section */}
            <div className="pt-16 max-w-4xl mx-auto">
              <div className="bg-white p-3 rounded-3xl shadow-[0_30px_80px_-15px_rgba(0,74,198,0.12)] border border-slate-200/60">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 text-left space-y-6">
                  {/* Mockup Header & Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-400" />
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-slate-400 ml-2">Horizon Dashboard Demo</span>
                    </div>
                    <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1 overflow-x-auto">
                      <button
                        id="showcase-tab-migration"
                        onClick={() => setActiveShowcaseTab('migration')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap ${
                          activeShowcaseTab === 'migration' 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Migrasi Server-to-Server
                      </button>
                      <button
                        id="showcase-tab-ai"
                        onClick={() => setActiveShowcaseTab('ai')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap ${
                          activeShowcaseTab === 'ai' 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        AI Workspace
                      </button>
                      <button
                        id="showcase-tab-storage"
                        onClick={() => setActiveShowcaseTab('storage')}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap ${
                          activeShowcaseTab === 'storage' 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Storage Node VPS
                      </button>
                    </div>
                  </div>

                  {/* Tab Contents */}
                  {activeShowcaseTab === 'migration' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
                        <div className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-center space-y-2">
                          <Cloud className="w-8 h-8 text-primary" />
                          <h4 className="text-xs font-bold text-slate-800">Google Drive</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">Folder: /Kuliah/Video</span>
                        </div>
                        <div className="md:col-span-1 flex flex-col items-center justify-center space-y-1">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-pulse">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          </div>
                          <span className="text-[10px] text-emerald-600 font-extrabold text-center uppercase tracking-wider">Server-to-Server</span>
                          <span className="text-[9px] text-slate-400 text-center font-bold">100% Hemat Kuota</span>
                        </div>
                        <div className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-purple-50/50 border border-purple-100 rounded-xl text-center space-y-2">
                          <Database className="w-8 h-8 text-purple-600" />
                          <h4 className="text-xs font-bold text-slate-800">Storage Node VPS</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">Folder: /Penyimpanan-Horizon</span>
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">File: Kuliah_Sistem_Operasi_Lengkap.mp4</span>
                          <span className="font-extrabold text-primary">94% (4.2 GB / 4.5 GB)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '94%' }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                          <span>Kecepatan Transfer: ~48 MB/detik</span>
                          <span className="text-emerald-600">✓ Kuota Internet Lokal Anda: 0 MB Terpakai</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeShowcaseTab === 'ai' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Berkas Terunggah</span>
                        <div className="flex items-center gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                          <FileText className="w-8 h-8 text-purple-600 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate">Laporan_Skripsi_Final.pdf</h4>
                            <span className="text-[9px] text-slate-400 font-semibold">12.8 MB • PDF Dokumen</span>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Ringkasan AI Instan</span>
                          <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                            Dokumen ini membahas arsitektur migrasi database multicloud dengan isolasi Storage Node pada Horizon.
                          </p>
                        </div>
                      </div>
                      <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between h-[220px]">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Diskusikan Dokumen</span>
                        <div className="space-y-3 flex-1 overflow-y-auto py-2">
                          <div className="bg-slate-50 p-2.5 rounded-xl text-xs font-semibold text-slate-700 max-w-[85%] self-end ml-auto">
                            Tolong jabarkan kesimpulan utama dari skripsi ini.
                          </div>
                          <div className="bg-primary/5 border border-primary/10 p-2.5 rounded-xl text-xs font-semibold text-slate-800 max-w-[85%]">
                            <span className="text-[9px] font-black text-primary block uppercase tracking-wide mb-1">Horizon AI</span>
                            Berdasarkan bab kesimpulan, pengujian membuktikan bahwa sistem migrasi server-to-server menghemat kuota internet pengguna hingga 100% dan mempercepat transfer file sebesar 4.2x.
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <input
                            type="text"
                            placeholder="Tanyakan sesuatu tentang dokumen ini..."
                            disabled
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 placeholder-slate-400 focus:outline-none"
                          />
                          <button disabled className="bg-primary text-white p-1.5 rounded-xl opacity-60">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeShowcaseTab === 'storage' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Status Penyimpanan VPS</span>
                        <div className="relative flex items-center justify-center py-2">
                          <div className="text-center">
                            <span className="text-2xl font-black text-slate-800">10 GB</span>
                            <span className="text-[10px] text-slate-400 font-bold block">Kapasitas Maksimal</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600">
                            <span>Penyimpanan Terpakai: 2.1 GB</span>
                            <span>Sisa: 7.9 GB</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: '21%' }} />
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Daftar Berkas Node Horizon</span>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-xs font-bold text-slate-700 truncate">Kuliah_Algoritma_StrukturData.pdf</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-bold">Tersimpan Aman</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                              <span className="text-xs font-bold text-slate-700 truncate">Video_Demonstrasi_Proyek.mp4</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-bold">Tersimpan Aman</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Share2 className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="text-xs font-bold text-slate-700 truncate">Slide_Presentasi_Final.pptx</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-bold">Link Publik Aktif</span>
                          </div>
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
          <div className="max-w-7xl mx-auto space-y-16">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Pindahkan File Tanpa Kuota, Tanpa Menunggu</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Transfer data berukuran giga-byte secara instan dari Google Drive langsung ke server VPS Storage Node Anda. Proses selesai otomatis di server tanpa menghabiskan kuota internet ponsel Anda.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Asisten Pintar yang Membaca untuk Anda</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Unggah file PDF materi kuliah, laporan kerja, atau skripsi. Gunakan asisten AI Horizon untuk memindai dokumen, merangkum poin-poin utama, dan melakukan tanya-jawab secara langsung.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Berbagi Cepat & Terkontrol</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Dapatkan tautan berbagi publik yang dienkripsi secara penuh dengan proteksi batas waktu kedaluwarsa otomatis. Berbagi file besar ke rekan tim menjadi aman dan terkendali.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Brankas File Berkecepatan Tinggi Anda</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Peroleh penyimpanan data cloud personal di server VPS Storage Node khusus. Kecepatan download-upload maksimal, aman terisolasi secara privat, dan bebas dari pelacakan eksternal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="cara-kerja" className="py-20 md:py-28 px-6">
          <div className="max-w-5xl mx-auto space-y-16">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
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
          <div className="max-w-7xl mx-auto space-y-16">
            
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
            <div className="max-w-xl mx-auto bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
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
                  onChange={(e) => setWorkspacesCount(Number(e.target.value))}
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

            {/* Pricing Cards List */}
            <div id="harga-cards" className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 items-stretch">
              
              {/* Card 1: Freemium */}
              <div className={`bg-white border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                recommendedPlan === 'FREEMIUM'
                  ? 'border-primary ring-4 ring-primary/10 shadow-xl scale-[1.03] md:-translate-y-2'
                  : 'border-slate-200 hover:border-slate-350 hover:shadow-md'
              }`}>
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
                  ? 'border-primary ring-4 ring-primary/10 shadow-xl scale-[1.03] md:-translate-y-2'
                  : 'border-slate-200 hover:border-slate-350 hover:shadow-md'
              }`}>
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
                  ? 'border-primary ring-4 ring-primary/10 shadow-xl scale-[1.03] md:-translate-y-2'
                  : 'border-slate-200 hover:border-slate-350 hover:shadow-md'
              }`}>
                {recommendedPlan === 'PREMIUM' && (
                  <span className="absolute -top-3 left-8 px-3.5 py-1 rounded-full text-[10px] font-black bg-primary text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Rekomendasi
                  </span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Kapasitas Maksimal</span>
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
            <div className="max-w-4xl mx-auto bg-blue-50/60 border border-blue-200/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
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
          <div className="max-w-4xl mx-auto space-y-16">
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

          <div className="max-w-3xl mx-auto text-center space-y-8">
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
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
              &copy; {new Date().getFullYear()} Horizon Cloud Team. Seluruh hak cipta dilindungi undang-undang.
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

    </div>
  );
}
