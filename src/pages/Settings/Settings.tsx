import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Cloud, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  User,
  HardDrive,
  Lock,
  Key,
  Phone,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import {
  fetchExternalAccounts,
  getGoogleAuthUrl,
  connectExternalAccount,
  disconnectExternalAccount,
  syncGoogleDriveFiles,
  fetchGoogleDriveStorage,
  ExternalAccountDto,
  GoogleDriveStorageDto
} from '../../api/externalAccounts';
import { fetchUserStorage, UserStorageResponse } from '../../api/storage';
import { updateProfile, updatePassword } from '../../api/auth';

declare global {
  interface Window {
    google: any;
  }
}

export default function Settings() {
  const { user, updateUserProfileState } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  // Tab Control
  const [activeTab, setActiveTab] = useState<'profile' | 'cloud'>('profile');

  // Google Accounts & Storage Info
  const [accounts, setAccounts] = useState<ExternalAccountDto[]>([]);
  const [storageInfo, setStorageInfo] = useState<Record<number, GoogleDriveStorageDto>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<Record<number, boolean>>({});
  const [isDisconnecting, setIsDisconnecting] = useState<Record<number, boolean>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Personal Storage Quota Info
  const [personalStorage, setPersonalStorage] = useState<UserStorageResponse | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Preset Avatars using Dicebear
  const avatarPresets = [
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=2563eb,4f46e5`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=059669,0d9488`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=e11d48,dc2626`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=d97706,ea580c`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=7c3aed,c084fc`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=475569,71717a`,
  ];

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Update profile inputs when user state is loaded
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Fetch accounts, Google Drive storage, and personal local storage on load
  const loadSettingsData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Load Google accounts
      const data = await fetchExternalAccounts();
      setAccounts(data);
      
      // Load storage for each connected Google account
      const storagePromises = data.map(async (acc) => {
        try {
          const storage = await fetchGoogleDriveStorage(acc.id);
          return { id: acc.id, storage };
        } catch (err) {
          console.warn(`Failed to fetch storage for account ${acc.id}`, err);
          return { id: acc.id, storage: null };
        }
      });

      const results = await Promise.all(storagePromises);
      const storageMap: Record<number, GoogleDriveStorageDto> = {};
      results.forEach((res) => {
        if (res.storage) storageMap[res.id] = res.storage;
      });
      setStorageInfo(storageMap);

      // Load Horizon Personal Storage
      const pStorage = await fetchUserStorage();
      setPersonalStorage(pStorage);
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat data pengaturan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleConnectGoogle = async () => {
    if (!window.google) {
      setError('Google SDK belum siap. Silakan coba sesaat lagi.');
      return;
    }
    setError('');
    setIsConnecting(true);
    try {
      const clientId = await getGoogleAuthUrl();
      if (!clientId) {
        throw new Error('Google Client ID tidak ditemukan di backend.');
      }

      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.error) {
            setError(`Otorisasi gagal: ${response.error}`);
            setIsConnecting(false);
            return;
          }
          if (response.code) {
            try {
              await connectExternalAccount(response.code);
              await loadSettingsData();
              toastSuccess('Akun Google Drive berhasil terhubung!');
            } catch (err: any) {
              console.error(err);
              setError(err.response?.data?.message || 'Gagal menyimpan akun Google Drive.');
              toastError('Gagal menyimpan akun Google Drive.');
            } finally {
              setIsConnecting(false);
            }
          }
        },
      });
      client.requestCode();
    } catch (err: any) {
      console.error(err);
      setError('Gagal memulai proses otorisasi Google.');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (id: number) => {
    setError('');
    setIsDisconnecting((prev) => ({ ...prev, [id]: true }));
    try {
      await disconnectExternalAccount(id);
      await loadSettingsData();
      toastSuccess('Akun Google Drive berhasil diputus.');
    } catch (err: any) {
      console.error(err);
      setError('Gagal memutuskan koneksi akun Google Drive.');
      toastError('Gagal memutuskan koneksi akun Google Drive.');
    } finally {
      setIsDisconnecting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSync = async (id: number) => {
    setError('');
    setIsSyncing((prev) => ({ ...prev, [id]: true }));
    try {
      await syncGoogleDriveFiles(id);
      await loadSettingsData();
      toastSuccess('Berkas Google Drive berhasil disinkronkan!');
    } catch (err: any) {
      console.error(err);
      setError('Gagal mensinkronisasikan berkas Google Drive.');
      toastError('Gagal mensinkronisasikan berkas Google Drive.');
    } finally {
      setIsSyncing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setError('');
    try {
      const updatedUser = await updateProfile({
        fullName,
        phoneNumber,
        avatarUrl
      });
      updateUserProfileState(updatedUser);
      toastSuccess('Profil Anda berhasil diperbarui!');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memperbarui profil.');
      toastError('Gagal memperbarui profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!oldPassword) {
      setPasswordError('Password lama wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await updatePassword({
        oldPassword,
        newPassword
      });
      toastSuccess('Password Anda berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.response?.data?.message || 'Password lama salah.');
      toastError('Gagal memperbarui password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculatePercent = (used: number, total: number) => {
    if (!total) return 0;
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const googleAccounts = accounts.filter((acc) => acc.provider.toUpperCase() === 'GOOGLE');
  
  // Storage Quota calculations
  const localUsed = personalStorage?.usedBytes || 0;
  const localTotal = personalStorage?.quotaBytes || 1073741824;
  const localPercent = calculatePercent(localUsed, localTotal);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6 sm:space-y-8 flex-1 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          Pengaturan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Atur data diri, keamanan profil, dan integrasi akun cloud eksternal Anda.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold border border-error/20 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0 animate-ping" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-100 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 uppercase tracking-wider ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-4 h-4" />
          Profil & Keamanan
        </button>
        <button
          onClick={() => setActiveTab('cloud')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 uppercase tracking-wider ${
            activeTab === 'cloud'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Cloud className="w-4 h-4" />
          Integrasi Cloud
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
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

            <form onSubmit={handleSaveProfile} className="space-y-6">
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
                          className={`w-9 h-9 rounded-full border-2 transition-all overflow-hidden hover:scale-105 active:scale-95 ${
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

          {/* Secure Change Password */}
          <Card hoverLift={false} className="p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <Key className="text-primary w-5 h-5" />
              <h2 className="text-base font-bold text-slate-800">Keamanan Kata Sandi</h2>
            </div>
            
            <p className="text-xs text-slate-400 font-semibold mb-6">
              Perbarui kata sandi Anda secara berkala untuk menjaga akun Horizon Drive tetap aman dari akses tidak sah.
            </p>

            {passwordError && (
              <div className="mb-5 p-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold border border-error/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <Input
                label="Kata Sandi Lama"
                type="password"
                placeholder="Masukkan kata sandi saat ini"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                leftIcon={Lock}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Kata Sandi Baru"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={Lock}
                />
                <Input
                  label="Konfirmasi Kata Sandi Baru"
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={Lock}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingPassword}
                  className="px-6 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Perbarui Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Local Storage Quota Card */}
          <Card hoverLift={false} className="p-6 md:p-8 border-l-4 border-l-primary">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-primary rounded-2xl shrink-0">
                <HardDrive className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800">Horizon Local Storage</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
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
                    <p className="text-[10px] text-slate-400 font-bold">
                      Anda telah menggunakan {localPercent}% dari kuota penyimpanan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'cloud' && (
        <div className="space-y-6">
          {/* Cloud Integrations */}
          <Card hoverLift={false}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Cloud className="text-primary w-6 h-6" />
                <h2 className="text-lg font-bold text-slate-900">Cloud Integrations</h2>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={ExternalLink}
                iconPosition="right"
                isLoading={isConnecting}
                onClick={handleConnectGoogle}
              >
                Hubungkan Google Drive
              </Button>
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center items-center">
                <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : googleAccounts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-2xl">
                Belum ada akun Google Drive terhubung. Klik tombol di atas untuk menghubungkan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {googleAccounts.map((googleAccount) => (
                  <div key={googleAccount.id} className="py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fadeIn">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shrink-0">
                        <HardDrive className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{googleAccount.email}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          Google Drive terhubung. Data disinkronisasikan ke Horizon Drive.
                        </p>
                        
                        {storageInfo[googleAccount.id] && (
                          <div className="mt-3 w-64 max-w-full">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1.5">
                              <span>Pemakaian Google Drive</span>
                              <span>
                                {formatSize(storageInfo[googleAccount.id].usedBytes)} / {formatSize(storageInfo[googleAccount.id].totalBytes)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${calculatePercent(storageInfo[googleAccount.id].usedBytes, storageInfo[googleAccount.id].totalBytes)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-center w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={RefreshCw}
                        isLoading={isSyncing[googleAccount.id]}
                        onClick={() => handleSync(googleAccount.id)}
                        className="flex-1 sm:flex-initial justify-center"
                      >
                        Sync Files
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        isLoading={isDisconnecting[googleAccount.id]}
                        onClick={() => handleDisconnect(googleAccount.id)}
                        className="flex-1 sm:flex-initial justify-center"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Security Info */}
          <Card hoverLift={false} className="border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Sistem Keamanan Horizon</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Horizon Drive mengenkripsi koneksi ke Google Drive Anda secara aman. Token OAuth disimpan terenkripsi di server VPS database dan didekripsi dinamis untuk proses request data saja.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
