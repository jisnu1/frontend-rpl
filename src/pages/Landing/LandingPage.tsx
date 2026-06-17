import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { submitBugReport } from '../../api/reports';

export default function LandingPage() {
  // FAQ accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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



  React.useEffect(() => {
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
      a: "Keamanan Anda adalah prioritas kami. Semua file Anda disimpan secara terisolasi di dalam VPS Storage Node pribadi Anda. Kami juga menggunakan protokol HTTPS terenkripsi penuh dan OAuth 2.0 resmi dari Google untuk menghubungkan Drive secara aman."
    },
    {
      q: "Bagaimana fitur AI menganalisis dokumen saya?",
      a: "Aplikasi kami mengintegrasikan model AI canggih (Gemini/Groq/Qwen) secara aman. AI akan memproses konten dokumen teks atau PDF Anda untuk membuat ringkasan instan dan melayani chat interaktif. Riwayat chat Anda bersifat pribadi dan tidak digunakan untuk melatih model kecerdasan buatan umum."
    },
    {
      q: "Apakah layanan Horizon Cloud ini berbayar?",
      a: "Horizon Cloud menyediakan akun gratis untuk semua pendaftar baru yang mencakup kuota penyimpanan Storage Node sebesar 1 GB, integrasi penuh dengan Google Drive, batas harian AI, serta sistem migrasi batch."
    }
  ];

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
            <a href="#fitur" className="hover:text-primary transition-colors">Fitur Utama</a>
            <a href="#cara-kerja" className="hover:text-primary transition-colors">Cara Kerja</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
            <a href="#lapor-bug" className="hover:text-primary transition-colors">Laporkan Bug</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              Masuk
            </Link>
            <Link 
              to="/register" 
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Kelola Seluruh Penyimpanan Cloud <br className="hidden sm:inline" />
              dalam <span className="bg-gradient-to-r from-primary to-[#0053db] bg-clip-text text-transparent">Satu Dasbor Praktis</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-semibold">
              Horizon Cloud mempermudah migrasi data secara server-to-server, merangkum berkas dengan AI cerdas, dan berbagi link secara aman tanpa menghabiskan kuota internet lokal Anda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                aria-label="Mulai Daftar Akun Horizon Cloud Gratis"
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-[#003da3] text-white text-base font-bold rounded-2xl shadow-[0_8px_25px_rgba(0,74,198,0.3)] hover:shadow-[0_12px_30px_rgba(0,74,198,0.4)] transition-all hover:-translate-y-1 text-center cursor-pointer"
              >
                Mulai Secara Gratis
              </Link>
              <a
                href="#fitur"
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-base font-bold rounded-2xl transition-all text-center cursor-pointer"
              >
                Pelajari Fitur
              </a>
            </div>

            {/* Dashboard Mockup Preview */}
            <div className="pt-12 md:pt-16 max-w-4xl mx-auto">
              <div className="bg-white p-3 rounded-2xl shadow-[0_30px_80px_-15px_rgba(0,74,198,0.12)] border border-slate-200/60 transition-transform duration-500 hover:scale-[1.01]">
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 sm:p-6 text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-400" />
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="px-4 py-1 rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Preview Dashboard
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary font-bold">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Storage Node</p>
                        <p className="text-sm font-bold text-slate-800">1.0 GB / 10 GB</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Kuota Migrasi</p>
                        <p className="text-sm font-bold text-slate-800">3 Batch / Hari</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">AI Guardrails</p>
                        <p className="text-sm font-bold text-slate-800">5 Permintaan / Hari</p>
                      </div>
                    </div>
                  </div>
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
                Dirancang untuk Produktivitas Data Anda
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed">
                Horizon Cloud menggabungkan manajemen multi-cloud yang tangguh dengan kecerdasan buatan guna memberikan efisiensi kerja yang maksimal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">One-Click Migration</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Pindahkan berkas dalam jumlah besar antara Google Drive dan VPS storage secara instan. Proses diselesaikan langsung secara server-to-server tanpa memotong data internet lokal.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">AI PDF Chat & Summary</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Tanyakan apa saja kepada dokumen Anda. AI kami akan menganalisis konten, merangkum informasi penting, dan melayani tanya-jawab dokumen secara instan dan tepat.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Secure File Sharing</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Bagikan file Anda secara publik maupun privat ke orang lain dengan tautan terenkripsi unik yang dilengkapi batas waktu kedaluwarsa otomatis demi perlindungan privasi.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-slate-50 p-8 rounded-2xl border border-slate-150 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_45px_rgba(0,74,198,0.08)] hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">VPS Storage Node</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Dapatkan penyimpanan cloud personal terisolasi pada server VPS tersendiri yang menjamin kecepatan unduhan dan integritas data Anda tanpa risiko kebocoran data.
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
                Bagaimana Horizon Bekerja?
              </h2>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                Hanya butuh tiga langkah praktis untuk mengintegrasikan dan mempercepat alur kerja penyimpanan data Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">Hubungkan Storage Anda</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
                  Daftar akun dan hubungkan akun Google Drive Anda secara aman melalui integrasi resmi Google OAuth 2.0.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">Pilih Berkas yang Diinginkan</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
                  Jelajahi seluruh berkas Anda di Google Drive maupun VPS lokal secara real-time langsung melalui satu dasbor terpadu.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4 relative">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">Mulai Migrasi atau Analisis AI</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
                  Klik tombol migrasi untuk transfer file otomatis atau gunakan asisten AI untuk memindai, merangkum, dan chat dengan berkas Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28 bg-white border-t border-slate-100 px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                Tanya Jawab
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-sm text-slate-500 font-semibold">
                Masih memiliki pertanyaan? Temukan jawabannya di bawah ini.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, i) => (
                <div 
                  key={i} 
                  className="bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden transition-all duration-300"
                >
                  <button
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
                    <p className="px-6 py-5 text-xs text-slate-500 font-semibold leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bug Report Section */}
        <section id="lapor-bug" className="py-20 md:py-28 bg-[#F8FAFC] border-t border-slate-100 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[300px] pointer-events-none -z-10 opacity-30">
            <div className="absolute top-0 left-1/4 w-[250px] h-[250px] rounded-full bg-blue-200/30 blur-[80px]" />
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto shadow-md">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Menemukan Kendala atau Bug di Aplikasi?
              </h2>
              <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto font-semibold leading-relaxed">
                Kami sangat berterima kasih atas kontribusi Anda. Laporkan setiap kendala teknis atau kirimkan masukan berharga agar kami bisa terus meningkatkan performa Horizon Cloud.
              </p>
            </div>

            <button
              onClick={() => setIsBugModalOpen(true)}
              className="px-8 py-3.5 bg-primary hover:bg-[#003da3] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
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
                to="/privacy"
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </Link>
              <span className="text-slate-700">|</span>
              <Link 
                to="/terms"
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
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" 
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
                onClick={() => setIsBugModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6">
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
                <form onSubmit={handleBugSubmit} className="space-y-5" noValidate>
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
                      type="button"
                      onClick={() => setIsBugModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
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
