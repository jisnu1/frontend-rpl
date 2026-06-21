import React from 'react';
import { User, UserCheck, Phone, HardDrive, BookOpen, Check, Mail } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { formatSize } from '../../../utils/fileHelpers';
import { sendAcademicOtp, verifyAcademicOtp } from '../../../api/academicAuth';
import { fetchUserProfile } from '../../../api/auth';
import { useAuth } from '../../../context/AuthContext';

interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles?: string[];
  academicEmail?: string;
  studentVerified?: boolean;
}

interface UserStorageResponse {
  usedBytes: number;
  quotaBytes: number;
}

interface ProfileSectionProps {
  user: UserDto | null;
  fullName: string;
  setFullName: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  avatarUrl: string;
  setAvatarUrl: (val: string) => void;
  isSavingProfile: boolean;
  handleSaveProfile: (e: React.FormEvent) => void;
  personalStorage: UserStorageResponse | null;
}

export default function ProfileSection({
  user,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  avatarUrl,
  setAvatarUrl,
  isSavingProfile,
  handleSaveProfile,
  personalStorage
}: ProfileSectionProps) {
  // Academic verification states
  const { accessToken, updateUserProfileState } = useAuth();
  const [academicVerificationOpen, setAcademicVerificationOpen] = React.useState(false);
  const [emailKampus, setEmailKampus] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [verifyingStep, setVerifyingStep] = React.useState<'input' | 'otp'>('input');
  const [academicLoading, setAcademicLoading] = React.useState(false);
  const [academicSuccess, setAcademicSuccess] = React.useState<string | null>(null);
  const [academicError, setAcademicError] = React.useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailKampus || !emailKampus.trim()) {
      setAcademicError("Email kampus tidak boleh kosong.");
      return;
    }
    setAcademicLoading(true);
    setAcademicError(null);
    setAcademicSuccess(null);
    try {
      await sendAcademicOtp(emailKampus.trim());
      setAcademicSuccess(`Kode OTP dikirim ke ${emailKampus.trim()}`);
      setVerifyingStep('otp');
    } catch (err: any) {
      setAcademicError(err.response?.data?.message || "Gagal mengirimkan OTP. Pastikan domain email valid.");
    } finally {
      setAcademicLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !otpCode.trim()) {
      setAcademicError("Kode OTP tidak boleh kosong.");
      return;
    }
    setAcademicLoading(true);
    setAcademicError(null);
    setAcademicSuccess(null);
    try {
      await verifyAcademicOtp(emailKampus.trim(), otpCode.trim());
      // Refresh profile
      try {
        const profile = await fetchUserProfile(accessToken || undefined);
        updateUserProfileState(profile);
      } catch (profileErr) {
        console.error("Gagal refresh profil:", profileErr);
      }
      setAcademicSuccess("Email kampus berhasil diverifikasi!");
      setAcademicVerificationOpen(false);
    } catch (err: any) {
      setAcademicError(err.response?.data?.message || "Kode OTP salah atau kedaluwarsa.");
    } finally {
      setAcademicLoading(false);
    }
  };

  // Preset Avatars using Dicebear
  const avatarPresets = [
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=2563eb,4f46e5`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=059669,0d9488`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=e11d48,dc2626`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=d97706,ea580c`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=7c3aed,c084fc`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=475569,71717a`,
  ];

  const calculatePercent = (used: number, total: number) => {
    if (!total) return 0;
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const localUsed = personalStorage?.usedBytes || 0;
  const localTotal = personalStorage?.quotaBytes || 1073741824;
  const localPercent = calculatePercent(localUsed, localTotal);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* User Profile Card */}
      <Card hoverLift={false} className="p-6 md:p-8">
        <div className="flex items-center gap-5 border-b border-slate-100 pb-6 mb-6">
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.username}
                className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-primary/20 hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-2 border-primary/20">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-primary text-white rounded-full shadow-sm">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {user?.username || 'User Profile'}
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
                {user?.roles?.[0]?.replace('ROLE_', '') || 'USER'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
          {/* Avatar Preset Custom Editor */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Kustomisasi Avatar
            </label>
            <div className="flex flex-wrap items-center gap-4">
              {/* Preset Grid */}
              <div className="flex gap-2">
                {avatarPresets.map((preset, idx) => {
                  const isSelected = avatarUrl === preset;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-9 h-9 rounded-full border-2 transition-all overflow-hidden hover:scale-105 active:scale-95 cursor-pointer ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-md' 
                          : 'border-transparent hover:border-slate-350'
                      }`}
                      title={`Preset Avatar ${idx + 1}`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              {/* Custom URL Input */}
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Atau masukkan URL foto kustom..."
                  value={avatarPresets.includes(avatarUrl) ? '' : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Form Input fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap Anda"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={User}
            />
            <Input
              label="Nomor Telepon"
              placeholder="e.g. 08123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={Phone}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingProfile}
              className="px-6 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
            >
              Simpan Profil
            </Button>
          </div>
        </form>
      </Card>

      {/* Status Mahasiswa / Verifikasi Akademik */}
      <Card hoverLift={false} className="p-6 md:p-8 border-l-4 border-l-cyan-500">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Status Mahasiswa & Akademik</h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-semibold">
                Verifikasi status akademik untuk mengklaim diskon berlangganan Premium Academic.
              </p>
            </div>

            {user?.studentVerified ? (
              <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3.5">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 bg-white rounded-full p-1 border border-emerald-200" />
                <div className="text-xs">
                  <p className="font-black">Akademik Terverifikasi</p>
                  <p className="font-semibold text-emerald-600/90 mt-0.5">Email kampus terhubung: {user.academicEmail}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-xl p-3.5 text-xs font-semibold leading-relaxed">
                  Status Anda saat ini belum terverifikasi mahasiswa. Daftarkan email kampus resmi Anda untuk mengaktifkan diskon.
                </div>

                {!academicVerificationOpen ? (
                  <Button
                    onClick={() => {
                      setAcademicVerificationOpen(true);
                      setVerifyingStep('input');
                      setEmailKampus('');
                      setOtpCode('');
                      setAcademicError(null);
                      setAcademicSuccess(null);
                    }}
                    variant="secondary"
                    className="px-5 py-2 text-xs font-black rounded-full"
                  >
                    Mulai Verifikasi Email Kampus
                  </Button>
                ) : (
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-black text-slate-700">Verifikasi Email Kampus</span>
                      <button 
                        type="button" 
                        onClick={() => setAcademicVerificationOpen(false)} 
                        className="text-xs font-black text-slate-400 hover:text-slate-650"
                      >
                        Batal
                      </button>
                    </div>

                    {academicError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold px-4 py-2.5 rounded-xl">
                        {academicError}
                      </div>
                    )}
                    {academicSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl">
                        {academicSuccess}
                      </div>
                    )}

                    {verifyingStep === 'input' ? (
                      <form onSubmit={handleSendOtp} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                            Email Kampus Resmi (.ac.id / .edu)
                          </label>
                          <Input
                            placeholder="nama@student.ui.ac.id"
                            value={emailKampus}
                            onChange={(e) => setEmailKampus(e.target.value)}
                            disabled={academicLoading}
                            className="py-2"
                          />
                        </div>
                        <Button
                          type="submit"
                          isLoading={academicLoading}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
                        >
                          Kirim Kode OTP
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                            Masukkan 6-Digit OTP
                          </label>
                          <Input
                            placeholder="000000"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            disabled={academicLoading}
                            className="py-2 text-center tracking-[0.2em] font-black text-lg"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              setVerifyingStep('input');
                              setAcademicError(null);
                              setAcademicSuccess(null);
                            }}
                            variant="secondary"
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                          >
                            Ubah Email
                          </Button>
                          <Button
                            type="submit"
                            isLoading={academicLoading}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
                          >
                            Verifikasi
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Local Storage Quota Card */}
      <Card hoverLift={false} className="p-6 md:p-8 border-l-4 border-l-primary">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-primary rounded-2xl shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800">Horizon Local Storage</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-semibold">
              Penyimpanan Personal Multistorage Management yang di-host langsung pada server Horizon VPS lokal Anda.
            </p>

            {personalStorage && (
              <div className="mt-4 max-w-md">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1.5">
                  <span>Pemakaian Personal Multistorage Management</span>
                  <span>
                    {formatSize(localUsed)} / {formatSize(localTotal)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      localPercent > 85 ? 'bg-error' : localPercent > 60 ? 'bg-amber-400' : 'bg-primary'
                    }`} 
                    style={{ width: `${localPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-450 font-black">
                  Anda telah menggunakan {localPercent}% dari kuota penyimpanan.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
