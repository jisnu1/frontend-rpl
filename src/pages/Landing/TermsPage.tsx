import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, ArrowLeft, Lock, ChevronRight, Menu, X, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('syarat');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const sections = [
    { id: 'syarat', label: '1. Persyaratan Penggunaan' },
    { id: 'tanggung-jawab', label: '2. Tanggung Jawab Akun' },
    { id: 'larangan', label: '3. Larangan Penggunaan (Prohibited)' },
    { id: 'lisensi', label: '4. Kepemilikan & Lisensi Berkas' },
    { id: 'ketersediaan', label: '5. Ketersediaan & Batasan Jaminan' },
    { id: 'pemutusan', label: '6. Pemutusan Sesi & Akun (Termination)' }
  ];

  useEffect(() => {
    // SEO Dynamic Meta Configuration
    document.title = "Ketentuan Layanan - Horizon Cloud";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Ketentuan Layanan resmi Horizon Cloud. Pelajari hak, batasan, kewajiban penggunaan penyimpanan, serta isolasi data VPS Storage Node Anda.");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
      setActiveSection(id);
      setIsMobileTocOpen(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-600 antialiased selection:bg-primary/20 selection:text-primary">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-150/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" id="terms-logo-link">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-[#0053db] flex items-center justify-center shadow-md">
              <Cloud className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">Horizon Cloud</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">Multi Storage</span>
            </div>
          </Link>

          <Link
            to="/"
            id="terms-back-home"
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="bg-white border-b border-slate-100 py-12 md:py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-max">
              <Lock className="w-4 h-4" />
              Ketentuan Hukum Resmi
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Ketentuan Layanan (Terms of Service)
            </h1>
            <p className="text-xs font-semibold text-slate-400">
              Aturan, syarat, serta tanggung jawab hukum dalam menggunakan layanan Horizon Cloud.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col items-start md:items-end gap-1 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pembaruan Terakhir</span>
            <span className="text-xs font-extrabold text-slate-800">Selasa, 16 Juni 2026</span>
          </div>
        </div>
      </section>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto w-full flex-1 px-6 py-10 flex flex-col lg:flex-row gap-10 relative">
        
        {/* Mobile TOC Trigger */}
        <div className="lg:hidden sticky top-20 z-30 bg-white/95 border border-slate-200/80 rounded-2xl p-3 shadow-md backdrop-blur-sm flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Menu className="w-4 h-4 text-primary" />
            Daftar Isi Dokumen
          </span>
          <button
            id="mobile-toc-toggle-terms"
            onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
            className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold rounded-lg transition-colors focus:outline-none"
          >
            {isMobileTocOpen ? 'Tutup' : 'Lihat'}
          </button>
        </div>

        {/* Mobile TOC Dropdown Modal */}
        {isMobileTocOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileTocOpen(false)} />
            <div className="relative w-full bg-white rounded-t-3xl p-6 border-t border-slate-200 space-y-4 shadow-2xl animate-slideUp max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-sm font-extrabold text-slate-800">Daftar Isi</span>
                <button onClick={() => setIsMobileTocOpen(false)} className="text-slate-500 hover:text-slate-700" id="mobile-toc-close-terms">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {sections.map((sect) => (
                  <button
                    key={sect.id}
                    id={`mobile-toc-terms-btn-${sect.id}`}
                    onClick={() => scrollToSection(sect.id)}
                    className={`text-left py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeSection === sect.id 
                        ? 'bg-primary/5 text-primary border border-primary/10' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sect.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Table of Contents - Desktop Only */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-28 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-50">
              Daftar Isi
            </h3>
            <nav className="flex flex-col gap-1.5">
              {sections.map((sect) => (
                <button
                  key={sect.id}
                  id={`desktop-toc-terms-btn-${sect.id}`}
                  onClick={() => scrollToSection(sect.id)}
                  className={`text-left py-2.5 px-3 rounded-xl text-[11px] font-extrabold transition-all border ${
                    activeSection === sect.id
                      ? 'bg-primary/5 text-primary border-primary/10 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'
                  }`}
                >
                  {sect.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Legal Content */}
        <article className="flex-1 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-sm min-w-0">
          <div className="max-w-3xl space-y-12">

            {/* Intro */}
            <div className="text-sm font-semibold leading-relaxed space-y-4">
              <p>
                Selamat datang di Horizon Cloud. Dokumen Ketentuan Layanan (<i>Terms of Service</i>) ini merupakan perjanjian hukum yang sah antara Anda selaku pengguna dengan tim pengembang Horizon Cloud mengenai penggunaan platform penyimpanan multi-cloud kami.
              </p>
              <p>
                Dengan membuat akun, mengakses dashboard, menghubungkan penyimpanan cloud eksternal, atau mengunggah data apa pun ke server kami, Anda menyatakan menyetujui seluruh ketentuan di bawah ini secara sadar dan sukarela.
              </p>
            </div>

            {/* Section 1 */}
            <section id="syarat" className="space-y-5 pt-4 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">01</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Persyaratan Penggunaan
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Untuk dapat mendaftar dan menggunakan layanan Horizon Cloud, Anda wajib memenuhi persyaratan kelayakan berikut:
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-3 items-start p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Kepatuhan Hukum Lokal</h5>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                      Anda harus secara hukum diizinkan untuk menggunakan layanan berbasis internet dan cloud sesuai dengan hukum yang berlaku di wilayah negara Republik Indonesia atau tempat Anda mengaksesnya.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Otoritas Kepemilikan Berkas</h5>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                      Anda harus memiliki kepemilikan penuh, lisensi, atau otorisasi resmi atas seluruh file yang Anda unggah, simpan, atau bagikan di platform Horizon Cloud.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="tanggung-jawab" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">02</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Tanggung Jawab Akun
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Anda bertanggung jawab penuh atas segala aktivitas yang terjadi di bawah akun Anda sendiri. Hal ini meliputi:
              </p>
              <ul className="list-decimal pl-6 text-xs font-bold text-slate-500 space-y-2.5 leading-relaxed">
                <li>
                  <strong className="text-slate-800 font-extrabold">Kerahasiaan Kredensial</strong>: Menjaga kerahasiaan kata sandi Anda dan membatasi akses perangkat fisik Anda agar tidak disalahgunakan oleh pihak lain.
                </li>
                <li>
                  <strong className="text-slate-800 font-extrabold">Alamat Email Valid</strong>: Memberikan alamat email aktif untuk keperluan penting seperti pengiriman kode OTP verifikasi registrasi dan pemulihan sandi.
                </li>
                <li>
                  <strong className="text-slate-800 font-extrabold">Penggunaan OAuth Token</strong>: Menjaga keamanan sesi Google OAuth Anda yang terhubung dengan API Google Drive milik Anda.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="larangan" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">03</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Larangan Penggunaan (Prohibited Actions)
                </h2>
              </div>
              
              {/* Highlight callout box - rose warning */}
              <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-5 md:p-6 space-y-3 shadow-sm shadow-rose-500/5">
                <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                  Konsekuensi Atas Penyalahgunaan Sistem
                </h4>
                <p className="text-xs font-bold text-rose-700 leading-relaxed">
                  Setiap tindakan eksploitasi, bypass batasan kuota gratis (1 GB), penyebaran file berbahaya, atau spamming API akan menyebabkan akun Anda langsung ditangguhkan secara permanen oleh admin tanpa pemberitahuan terlebih dahulu.
                </p>
              </div>

              <p className="text-xs font-semibold leading-relaxed">
                As pengguna, Anda setuju untuk <b>TIDAK</b> melakukan tindakan berikut:
              </p>
              <ul className="list-disc pl-6 text-xs font-bold text-slate-500 space-y-2 leading-relaxed">
                <li>Mengunggah virus, malware, adware, ransomware, atau skrip berbahaya lainnya.</li>
                <li>Mencoba mengeksploitasi sistem atau mematikan database R2DBC dan VPS Storage Node.</li>
                <li>Mengunggah file yang melanggar Hak Kekayaan Intelektual (IPR) milik orang lain atau konten ilegal.</li>
                <li>Melakukan serangan <i>brute force</i> pada halaman login atau spamming pada server AI.</li>
                <li>Menyebarkan tautan berbagi berkas publik yang melanggar ketentuan hukum negara.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="lisensi" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">04</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Kepemilikan & Lisensi Berkas
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Hak kepemilikan atas berkas yang diunggah sepenuhnya berada di tangan pengguna. Namun, agar kami dapat menyediakan fitur aplikasi secara normal, Anda memberikan lisensi terbatas kepada Horizon Cloud untuk melakukan tindakan operasional berikut:
              </p>
              <ul className="list-decimal pl-6 text-xs font-bold text-slate-500 space-y-2.5 leading-relaxed">
                <li>
                  <strong className="text-slate-800 font-extrabold">Penyimpanan Fisik</strong>: Menyimpan dan memindahkan berkas fisik Anda di server VPS Storage Node lokal kami.
                </li>
                <li>
                  <strong className="text-slate-800 font-extrabold">Pratampilan Berkas</strong>: Melakukan render dokumen (PDF, gambar, video, audio) untuk memfasilitasi penayangan langsung (<i>streaming</i>) di browser Anda.
                </li>
                <li>
                  <strong className="text-slate-800 font-extrabold">Analisis AI & OCR</strong>: Mengekstrak teks tulisan dari dokumen PDF yang Anda unggah untuk keperluan pembuatan ringkasan otomatis dan layanan chat interaktif AI.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="ketersediaan" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">05</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Ketersediaan & Batasan Jaminan
                </h2>
              </div>

              {/* Highlight callout box - amber warning */}
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 md:p-6 space-y-3 shadow-sm shadow-amber-500/5">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                  Imbauan Penting: Lakukan Backup Mandiri Sekunder
                </h4>
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Layanan Horizon Cloud disediakan secara "apa adanya" (as-is) tanpa jaminan tanpa gangguan. Kami sangat menyarankan pengguna untuk selalu memiliki salinan cadangan (<i>backup</i>) sekunder dari data-data penting di perangkat fisik lokal masing-masing.
                </p>
              </div>

              <div className="text-xs font-semibold leading-relaxed space-y-3">
                <p>
                  Kami tidak bertanggung jawab atas kegagalan transfer file, kerusakan berkas, atau hilangnya data pada Storage Node maupun akun Google Drive Anda yang disebabkan oleh pemadaman jaringan API pihak ketiga, bencana alam (<i>force majeure</i>), atau gangguan teknis server luar.
                </p>
                <p>
                  Fitur migrasi cloud dan integrasi AI sangat bergantung pada kelancaran layanan pihak ketiga (Google API, Brevo API, Groq/Gemini API) dan dapat berubah sewaktu-waktu tanpa pemberitahuan.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="pemutusan" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">06</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Pemutusan Sesi & Akun (Termination)
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Kami berhak menangguhkan, memblokir sesi JWT, atau menghapus akun Anda secara permanen beserta seluruh berkas fisiknya dari Storage Node apabila:
              </p>
              <ul className="list-disc pl-6 text-xs font-bold text-slate-500 space-y-2 leading-relaxed">
                <li>Anda terbukti melanggar butir-butir ketentuan di dalam dokumen Ketentuan Layanan ini.</li>
                <li>Akun gratis Anda terdeteksi tidak aktif (<i>idle</i>) selama lebih dari 12 bulan berturut-turut.</li>
                <li>Terjadi tindakan eksploitasi API yang mengancam stabilitas operasional server pengguna lain.</li>
              </ul>
            </section>

            {/* Bottom Navigation Card */}
            <div className="border border-slate-200/80 rounded-3xl p-6 md:p-8 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-12">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800">Bagaimana Cara Kami Menjaga Data Anda?</h4>
                <p className="text-[11px] font-semibold text-slate-500 leading-normal">
                  Baca dokumen Kebijakan Privasi kami untuk mengetahui rincian proteksi enkripsi data Anda.
                </p>
              </div>
              <Link
                to="/privacy-policy"
                id="terms-goto-privacy"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors self-start md:self-auto shadow-sm"
              >
                <span>Kebijakan Privasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-10 px-6 border-t border-slate-800 text-center text-xs font-semibold">
        <p>&copy; {new Date().getFullYear()} Horizon Cloud Team. Seluruh hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  );
}
