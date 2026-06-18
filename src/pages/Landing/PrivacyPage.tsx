import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, ArrowLeft, ShieldCheck, CheckCircle2, ChevronRight, Menu, X, ArrowRight } from 'lucide-react';

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('koleksi');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const sections = [
    { id: 'koleksi', label: '1. Informasi yang Dikumpulkan' },
    { id: 'penggunaan', label: '2. Cara Penggunaan Informasi' },
    { id: 'berkas', label: '3. Berkas & Konten Pengguna' },
    { id: 'keamanan', label: '4. Keamanan & Enkripsi Data' },
    { id: 'pihak-ketiga', label: '5. Layanan Pihak Ketiga' },
    { id: 'hak-user', label: '6. Hak Asasi Pengguna' },
    { id: 'limited-use', label: '7. Kebijakan Limited Use Google' },
    { id: 'kontak', label: '8. Informasi Kontak' }
  ];

  useEffect(() => {
    // SEO Dynamic Meta Configuration
    document.title = "Kebijakan Privasi - Horizon Cloud";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Kebijakan Privasi resmi Horizon Cloud. Pelajari bagaimana kami mengelola, mengenkripsi, dan melindungi berkas personal serta privasi akun Anda.");
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
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-650 antialiased selection:bg-primary/20 selection:text-primary">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-150/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" id="privacy-logo-link">
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
            id="privacy-back-home"
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
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-max">
              <ShieldCheck className="w-4 h-4" />
              Dokumen Hukum Resmi
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Kebijakan Privasi (Privacy Policy)
            </h1>
            <p className="text-xs font-semibold text-slate-400">
              Pelajari bagaimana kami mengelola, melindungi, dan menghargai data pribadi Anda.
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
            id="mobile-toc-toggle"
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
                <span className="text-sm font-extrabold text-slate-850">Daftar Isi</span>
                <button onClick={() => setIsMobileTocOpen(false)} className="text-slate-450 hover:text-slate-700" id="mobile-toc-close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {sections.map((sect) => (
                  <button
                    key={sect.id}
                    id={`mobile-toc-btn-${sect.id}`}
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
                  id={`desktop-toc-btn-${sect.id}`}
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
                Selamat datang di Horizon Cloud. Privasi Anda adalah prioritas utama kami. Kebijakan Privasi ini dirancang untuk membantu Anda memahami bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda sewaktu Anda berinteraksi dengan layanan penyimpanan cloud personal kami.
              </p>
              <p>
                Dengan mendaftarkan akun atau mengunggah data ke platform kami, Anda menyatakan bahwa Anda memahami dan menyetujui seluruh tata cara pengelolaan informasi sebagaimana dijelaskan di bawah ini.
              </p>
            </div>

            {/* Section 1 */}
            <section id="koleksi" className="space-y-5 pt-4 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">01</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Informasi Yang Kami Kumpulkan
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Kami mengumpulkan sejumlah data untuk memastikan layanan penyimpanan multi-cloud dapat berfungsi secara optimal dan aman. Data tersebut mencakup:
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-2.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Data Profil Akun
                  </h4>
                  <ul className="text-xs font-bold text-slate-500 list-disc pl-4 space-y-1 leading-normal">
                    <li>Nama lengkap & alamat email aktif</li>
                    <li>Nomor telepon pengguna</li>
                    <li>Kredensial password terenkripsi</li>
                    <li>URL foto profil (Avatar - opsional)</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-2.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Data Cloud Pihak Ketiga
                  </h4>
                  <ul className="text-xs font-bold text-slate-500 list-disc pl-4 space-y-1 leading-normal">
                    <li>Google OAuth Authorization Tokens</li>
                    <li>Access Token & Refresh Token Google Drive</li>
                    <li>Waktu kedaluwarsa otorisasi OAuth</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-2.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Metadata File & Penggunaan
                  </h4>
                  <ul className="text-xs font-bold text-slate-500 list-disc pl-4 space-y-1 leading-normal">
                    <li>Nama berkas, tipe berkas, & ukuran berkas</li>
                    <li>Status tautan berbagi (publik/privat)</li>
                    <li>Catatan kuota penyimpanan VPS Node</li>
                    <li>Statistik log aktivitas unduh/unggah</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-2.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Informasi Teknis
                  </h4>
                  <ul className="text-xs font-bold text-slate-500 list-disc pl-4 space-y-1 leading-normal">
                    <li>Alamat IP & informasi sistem browser</li>
                    <li>Log aktivitas sesi autentikasi pengguna</li>
                    <li>Log error sistem untuk perbaikan bug</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="penggunaan" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">02</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Cara Penggunaan Informasi
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Informasi yang kami kumpulkan diproses demi tujuan penyediaan layanan berkualitas tinggi:
              </p>
              <ul className="list-decimal pl-6 text-xs font-bold text-slate-500 space-y-2.5 leading-relaxed">
                <li>
                  <strong className="text-slate-800 font-extrabold">Operasional Sistem</strong>: Mengotentikasi login, mengirimkan kode keamanan OTP pendaftaran, dan memverifikasi status akun Anda.
                </li>
                <li>
                  <strong className="text-slate-800 font-extrabold">Migrasi & Manajemen Berkas</strong>: Melakukan transfer file server-to-server langsung antara penyimpanan lokal VPS Node dan Google Drive atas perintah Anda.
                </li>
                <li>
                  <strong className="text-slate-800 font-extrabold">Layanan Kecerdasan Buatan (AI)</strong>: Memproses dokumen melalui model AI (seperti Gemini) untuk meringkas dan chat dengan dokumen secara privat.
                </li>
                <li>
                  <strong className="text-slate-800 font-extrabold">Pencegahan Penyalahgunaan</strong>: Memantau percobaan pencurian sandi, eksploitasi batas kuota gratis (1 GB), serta mencegah infeksi malware.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="berkas" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">03</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Berkas & Konten Pengguna
                </h2>
              </div>
              
              {/* Highlight callout box - emerald */}
              <div className="bg-emerald-50 border border-emerald-250/60 rounded-2xl p-5 md:p-6 space-y-3 shadow-sm shadow-emerald-500/5">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Kedaulatan Konten & Hak Milik Berkas Anda
                </h4>
                <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                  Kami sepenuhnya menghargai hak kepemilikan Anda. Anda mempertahankan kepemilikan penuh atas setiap berkas yang Anda unggah. Kami tidak akan pernah mengklaim kepemilikan, menyalin, mendistribusikan, atau menjual berkas Anda kepada pihak mana pun.
                </p>
              </div>

              <p className="text-xs font-semibold leading-relaxed">
                Isi file Anda diproses murni untuk mendukung fitur aplikasi (seperti pembuatan gambar pratampilan berkas, konversi streaming file video/audio ke browser, serta ekstraksi OCR dokumen untuk asisten AI). Staf kami dilarang keras mengakses file Anda secara manual kecuali atas permintaan tertulis dari Anda untuk pemecahan masalah teknis, atau jika diwajibkan secara tegas oleh hukum negara.
              </p>
            </section>

            {/* Section 4 */}
            <section id="keamanan" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">04</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Keamanan & Enkripsi Data
                </h2>
              </div>
              
              {/* Highlight callout box - indigo */}
              <div className="bg-indigo-50 border border-indigo-250/60 rounded-2xl p-5 md:p-6 space-y-3 shadow-sm shadow-indigo-500/5">
                <h4 className="text-xs font-black text-indigo-850 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  Teknologi Enkripsi Seluler & Transmisi
                </h4>
                <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                  Semua transaksi data dari browser Anda ke server kami, maupun transfer data antara Storage Node VPS ke Google Drive, dilindungi enkripsi SSL/TLS tingkat tinggi dalam transit guna mencegah pembacaan data ilegal di tengah jalan (*man-in-the-middle attack*).
                </p>
              </div>

              <div className="text-xs font-semibold leading-relaxed space-y-3">
                <p>
                  Kredensial login Anda diamankan dengan metode enkripsi searah menggunakan kriptografi **BCrypt** di database utama.
                </p>
                <p>
                  Setiap akun pengguna memiliki isolasi direktori berkas yang ketat di tingkat server, didukung oleh validasi otentikasi token JWT (*JSON Web Token*) yang kedaluwarsa secara terjadwal untuk mencegah kebocoran sesi login.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="pihak-ketiga" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">05</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Layanan Pihak Ketiga
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Untuk menyediakan fungsionalitas yang terintegrasi, Horizon Cloud terhubung dengan beberapa layanan pihak ketiga terkemuka:
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">G</div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Google Drive API</h5>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                      Digunakan untuk menghubungkan akun Google Drive Anda, menjelajahi file, serta memindahkan berkas secara server-to-server atas izin OAuth 2.0.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">B</div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Brevo Email SMTP</h5>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                      Mengirimkan email autentikasi berisi kode One-Time Password (OTP) ke kotak masuk Anda untuk verifikasi registrasi serta pemulihan kata sandi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">AI</div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Gemini AI / Fallback AI Provider</h5>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                      Memproses ekstraksi teks dokumen untuk membuat ringkasan dan melayani obrolan asisten AI secara aman.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="hak-user" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">06</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Hak Asasi Pengguna
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Sebagai pemilik data yang sah, Anda memegang hak penuh untuk melakukan tindakan berikut kapan saja:
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-3 items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-[10px] font-bold">1</div>
                  <span className="text-xs font-bold text-slate-700">Melihat dan merubah profil data diri (Nama Lengkap, Nomor Telepon, Avatar).</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-[10px] font-bold">2</div>
                  <span className="text-xs font-bold text-slate-700">Memutuskan sambungan Google Drive (yang akan otomatis menghapus seluruh token dari sistem).</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-[10px] font-bold">3</div>
                  <span className="text-xs font-bold text-slate-700">Melakukan pengubahan atau pemulihan kata sandi secara mandiri.</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-[10px] font-bold">4</div>
                  <span className="text-xs font-bold text-slate-700">Meminta penghapusan akun secara permanen beserta file fisik di Storage Node (melalui admin).</span>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="limited-use" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">07</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Kebijakan Limited Use Google
                </h2>
              </div>
              
              {/* Highlight callout box - amber */}
              <div className="bg-amber-50 border border-amber-250/60 rounded-2xl p-5 md:p-6 space-y-3 shadow-sm shadow-amber-500/5">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  Kepatuhan Google API Services User Data Policy
                </h4>
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Penggunaan dan transfer informasi yang diterima dari Google API oleh Horizon Cloud ke aplikasi lain akan sepenuhnya mematuhi <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline text-amber-800 hover:text-amber-950 font-bold">Kebijakan Data Pengguna Layanan API Google</a>, termasuk persyaratan Penggunaan Terbatas (<em>Limited Use</em>).
                </p>
                <p className="text-[11px] font-bold text-amber-600/90 italic leading-relaxed">
                  (Horizon Cloud's use and transfer to any other app of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements.)
                </p>
              </div>

              <p className="text-xs font-semibold leading-relaxed">
                Kami tidak menggunakan, membagikan, atau mentransfer data yang diperoleh dari Google API untuk tujuan periklanan, pemasaran, atau profiling pengguna. Seluruh data akses token Google Drive digunakan murni secara otomatis oleh sistem untuk memfasilitasi fitur transfer file personal Anda.
              </p>
            </section>

            {/* Section 8 */}
            <section id="kontak" className="space-y-5 scroll-mt-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-sm font-black text-primary">08</span>
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Informasi Kontak
                </h2>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                Jika Anda memiliki pertanyaan, kendala teknis, atau masukan mengenai Kebijakan Privasi ini, jangan ragu untuk menghubungi tim pengembang kami:
              </p>
              <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Nama Aplikasi:</span>
                  <span className="text-slate-800">Horizon Cloud</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Email Kontak Developer:</span>
                  <span className="text-primary hover:underline font-bold">
                    <a href="mailto:emuyforge@gmail.com">emuyforge@gmail.com</a>
                  </span>
                </div>
              </div>
            </section>

            {/* Bottom Navigation Card */}
            <div className="border border-slate-200/80 rounded-3xl p-6 md:p-8 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-12">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800">Butuh Informasi Lebih Lengkap?</h4>
                <p className="text-[11px] font-semibold text-slate-500 leading-normal">
                  Baca juga dokumen Ketentuan Layanan untuk mengetahui hak dan kewajiban hukum Anda.
                </p>
              </div>
              <Link
                to="/term-of-service"
                id="privacy-goto-terms"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors self-start md:self-auto shadow-sm"
              >
                <span>Ketentuan Layanan</span>
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
