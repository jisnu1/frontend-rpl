import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Cloud, 
  User,
  MessageSquareWarning
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
import { submitBugReport } from '../../api/reports';

// Sub-components
import ProfileSection from './components/ProfileSection';
import SecuritySection from './components/SecuritySection';
import CloudIntegrationSection from './components/CloudIntegrationSection';
import BugReportSection from './components/BugReportSection';

declare global {
  interface Window {
    google: any;
  }
}

export default function Settings() {
  const { user, updateUserProfileState } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  // Tab Control
  const [activeTab, setActiveTab] = useState<'profile' | 'cloud' | 'report'>('profile');

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

  // Report Bug Form States
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const [reportRemainingAttempts, setReportRemainingAttempts] = useState<number | null>(null);
  const [reportLockoutTime, setReportLockoutTime] = useState<number>(() => {
    const saved = localStorage.getItem('lockout_report');
    if (!saved) return 0;
    const expiresAt = Number(saved);
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    if (reportLockoutTime <= 0) {
      localStorage.removeItem('lockout_report');
      return;
    }
    const timer = setInterval(() => {
      setReportLockoutTime(prev => {
        const next = prev - 1;
        if (next <= 0) {
          localStorage.removeItem('lockout_report');
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [reportLockoutTime]);

  const formatReportTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportDescription.trim().length < 5 || reportLockoutTime > 0) return;
    
    setIsSubmittingReport(true);
    try {
      await submitBugReport(reportDescription);
      setIsReportSubmitted(true);
      setReportRemainingAttempts(null);
      localStorage.removeItem('lockout_report');
      toastSuccess('Laporan bug berhasil dikirim. Terima kasih!');
    } catch (err: any) {
      console.error(err);

      const headers = err.response?.headers;
      if (headers) {
        const remaining = headers['x-ratelimit-remaining'];
        if (remaining !== undefined) {
          setReportRemainingAttempts(Number(remaining));
        }

        if (err.response?.status === 429) {
          const reset = headers['x-ratelimit-reset'] || headers['retry-after'];
          const resetTime = reset ? Number(reset) : 3600;
          setReportLockoutTime(resetTime);
          localStorage.setItem('lockout_report', String(Date.now() + resetTime * 1000));
        }
      }

      const msg = err.response?.data?.message || err.message || 'Gagal mengirimkan laporan bug.';
      toastError(msg);
    } finally {
      setIsSubmittingReport(false);
    }
  };

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

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const loadSettingsData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchExternalAccounts();
      setAccounts(data);
      
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
        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
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
    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal harus 8 karakter.');
      return;
    }
    // Check if new password contains at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      setPasswordError('Kata sandi harus mengandung kombinasi huruf dan angka.');
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
      <div className="flex border-b border-slate-100 text-xs font-bold gap-1 sm:gap-6 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 uppercase tracking-wider shrink-0 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Profil &</span> Keamanan
        </button>
        <button
          onClick={() => setActiveTab('cloud')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 uppercase tracking-wider shrink-0 cursor-pointer ${
            activeTab === 'cloud'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span className="hidden sm:inline">Integrasi </span>Cloud
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 uppercase tracking-wider shrink-0 cursor-pointer ${
            activeTab === 'report'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4" />
          <span className="hidden sm:inline">Laporkan </span>Masalah
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <ProfileSection 
            user={user}
            fullName={fullName}
            setFullName={setFullName}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            isSavingProfile={isSavingProfile}
            handleSaveProfile={handleSaveProfile}
            personalStorage={personalStorage}
          />

          <SecuritySection 
            oldPassword={oldPassword}
            setOldPassword={setOldPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isSavingPassword={isSavingPassword}
            handleSavePassword={handleSavePassword}
            passwordError={passwordError}
          />
        </div>
      )}

      {activeTab === 'cloud' && (
        <CloudIntegrationSection 
          accounts={accounts}
          storageInfo={storageInfo}
          isLoading={isLoading}
          isSyncing={isSyncing}
          isDisconnecting={isDisconnecting}
          isConnecting={isConnecting}
          handleConnectGoogle={handleConnectGoogle}
          handleDisconnect={handleDisconnect}
          handleSync={handleSync}
        />
      )}

      {activeTab === 'report' && (
        <BugReportSection 
          isReportSubmitted={isReportSubmitted}
          setIsReportSubmitted={setIsReportSubmitted}
          reportDescription={reportDescription}
          setReportDescription={setReportDescription}
          isSubmittingReport={isSubmittingReport}
          reportLockoutTime={reportLockoutTime}
          reportRemainingAttempts={reportRemainingAttempts}
          handleReportSubmit={handleReportSubmit}
          formatReportTime={formatReportTime}
        />
      )}
    </div>
  );
}
