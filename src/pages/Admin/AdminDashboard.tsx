import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Cpu, 
  Activity, 
  Settings2, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';
import { 
  fetchAdminSettings, 
  updateAdminSettings, 
  fetchAdminUsers, 
  updateUserStatus, 
  updateUserAiLimit, 
  updateUserStorageQuota, 
  fetchUserActivities, 
  fetchAiTokenStats,
  updateUserMigrationLimit,
  updateUserMigrationMaxSize,
  fetchSubscriptionRequests,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  directUpdateUserSubscription,
  deleteUser,
  AppSetting,
  AdminUserResponse,
  UserActivity,
  AiTokenStats
} from '../../api/admin';

import { SubscriptionRequest } from '../../types/auth.types';

// Import Modular Components
import QuotaModal from './components/QuotaModal';
import AiLimitModal from './components/AiLimitModal';
import MigrationLimitModal from './components/MigrationLimitModal';
import SubscriptionModal from './components/SubscriptionModal';
import StatsTab from './components/StatsTab';
import UsersTab from './components/UsersTab';
import LogsTab from './components/LogsTab';
import AiConfigTab from './components/AiConfigTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'logs' | 'ai'>('stats');
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [tokenStats, setTokenStats] = useState<AiTokenStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<SubscriptionRequest[]>([]);
  
  // Pagination for logs
  const [logPage, setLogPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);
  const [newQuotaValue, setNewQuotaValue] = useState<string>('');
  const [newQuotaUnit, setNewQuotaUnit] = useState<'MB' | 'GB' | 'TB'>('GB');
  const [newAiLimit, setNewAiLimit] = useState<number>(5);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [aiLimitModalOpen, setAiLimitModalOpen] = useState(false);
  const [migrationLimitModalOpen, setMigrationLimitModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [newMigrationDailyLimit, setNewMigrationDailyLimit] = useState<number>(3);
  const [newMigrationMaxSizeValue, setNewMigrationMaxSizeValue] = useState<string>('256');
  const [newMigrationMaxSizeUnit, setNewMigrationMaxSizeUnit] = useState<'MB' | 'GB' | 'TB'>('MB');

  // AI config form state
  const [aiForm, setAiForm] = useState<Record<string, string>>({});
  const [promptAccordionOpen, setPromptAccordionOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, logPage]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const stats = await fetchAiTokenStats();
        setTokenStats(stats);
      } else if (activeTab === 'users') {
        const [usersList, pendingList] = await Promise.all([
          fetchAdminUsers(),
          fetchSubscriptionRequests()
        ]);
        setUsers(usersList);
        setPendingRequests(pendingList);
      } else if (activeTab === 'logs') {
        const logsList = await fetchUserActivities(logPage, 20);
        setActivities(logsList);
      } else if (activeTab === 'ai') {
        const settingsList = await fetchAdminSettings();
        setSettings(settingsList);
        // Map settings array to key-value record for form
        const formObj: Record<string, string> = {};
        settingsList.forEach(s => {
          formObj[s.key] = s.value;
        });
        setAiForm(formObj);
      }
    } catch (err: any) {
      console.error(err);
      showMessage('Gagal memuat data dari server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleToggleStatus = async (user: AdminUserResponse) => {
    try {
      const nextStatus = !user.isActive;
      await updateUserStatus(user.id, nextStatus);
      showMessage(`Status user ${user.username} berhasil diubah.`, 'success');
      loadData();
    } catch (err) {
      showMessage('Gagal mengubah status aktif user.', 'error');
    }
  };

  const handleDeleteUser = async (user: AdminUserResponse) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus user ${user.username || user.fullName}?\n\nTindakan ini bersifat PERMANEN dan akan menghapus berkas fisik miliknya di storage node serta memutuskan koneksi Google Drive.`);
    if (!confirmed) return;
    try {
      await deleteUser(user.id);
      showMessage(`User ${user.username} berhasil dihapus beserta seluruh berkas & koneksi awannya.`, 'success');
      loadData();
    } catch (err) {
      showMessage('Gagal menghapus user.', 'error');
    }
  };

  const openQuotaModal = (user: AdminUserResponse) => {
    setEditingUser(user);
    const quota = user.storageQuota || 1073741824;
    const gb = quota / (1024 * 1024 * 1024);
    setNewQuotaValue(gb % 1 === 0 ? gb.toString() : gb.toFixed(1));
    setNewQuotaUnit('GB');
    setQuotaModalOpen(true);
  };

  const handleUpdateQuota = async () => {
    if (!editingUser) return;
    try {
      const val = parseFloat(newQuotaValue);
      if (isNaN(val) || val <= 0) {
        showMessage('Nilai kuota tidak valid.', 'error');
        return;
      }
      
      let multiplier = 1024 * 1024; // MB default
      if (newQuotaUnit === 'GB') multiplier *= 1024;
      if (newQuotaUnit === 'TB') multiplier *= 1024 * 1024;
      
      const bytes = Math.round(val * multiplier);
      await updateUserStorageQuota(editingUser.id, bytes);
      showMessage(`Kuota penyimpanan ${editingUser.username} berhasil diperbarui.`, 'success');
      setQuotaModalOpen(false);
      loadData();
    } catch (err) {
      showMessage('Gagal memperbarui kuota penyimpanan.', 'error');
    }
  };

  const openAiLimitModal = (user: AdminUserResponse) => {
    setEditingUser(user);
    setNewAiLimit(user.aiDailyLimit || 5);
    setAiLimitModalOpen(true);
  };

  const handleUpdateAiLimit = async () => {
    if (!editingUser) return;
    try {
      if (newAiLimit < 0) {
        showMessage('Batas AI harian tidak boleh negatif.', 'error');
        return;
      }
      await updateUserAiLimit(editingUser.id, newAiLimit);
      showMessage(`Batas AI harian ${editingUser.username} berhasil diperbarui.`, 'success');
      setAiLimitModalOpen(false);
      loadData();
    } catch (err) {
      showMessage('Gagal memperbarui batas AI harian.', 'error');
    }
  };

  const openMigrationLimitModal = (user: AdminUserResponse) => {
    setEditingUser(user);
    setNewMigrationDailyLimit(user.migrationDailyLimit != null ? user.migrationDailyLimit : 3);
    
    const maxFileSize = user.migrationMaxFileSize != null ? user.migrationMaxFileSize : 268435456;
    const mb = maxFileSize / (1024 * 1024);
    if (mb >= 1024 && mb % 1024 === 0) {
      setNewMigrationMaxSizeValue((mb / 1024).toString());
      setNewMigrationMaxSizeUnit('GB');
    } else {
      setNewMigrationMaxSizeValue(mb % 1 === 0 ? mb.toString() : mb.toFixed(1));
      setNewMigrationMaxSizeUnit('MB');
    }
    
    setMigrationLimitModalOpen(true);
  };

  const handleUpdateMigrationLimits = async () => {
    if (!editingUser) return;
    try {
      const dailyLimitVal = newMigrationDailyLimit;
      if (dailyLimitVal < 0) {
        showMessage('Batas migrasi harian tidak boleh negatif.', 'error');
        return;
      }

      const sizeVal = parseFloat(newMigrationMaxSizeValue);
      if (isNaN(sizeVal) || sizeVal <= 0) {
        showMessage('Nilai batas ukuran file tidak valid.', 'error');
        return;
      }

      let multiplier = 1024 * 1024; // MB default
      if (newMigrationMaxSizeUnit === 'GB') multiplier *= 1024;
      if (newMigrationMaxSizeUnit === 'TB') multiplier *= 1024 * 1024;

      const sizeBytes = Math.round(sizeVal * multiplier);

      await updateUserMigrationLimit(editingUser.id, dailyLimitVal);
      await updateUserMigrationMaxSize(editingUser.id, sizeBytes);

      showMessage(`Batas migrasi untuk ${editingUser.username} berhasil diperbarui.`, 'success');
      setMigrationLimitModalOpen(false);
      loadData();
    } catch (err) {
      showMessage('Gagal memperbarui batas migrasi pengguna.', 'error');
    }
  };

  const openSubscriptionModal = (user: AdminUserResponse) => {
    setEditingUser(user);
    setSubscriptionModalOpen(true);
  };

  const handleUpdateSubscription = async (newTier: string) => {
    if (!editingUser) return;
    try {
      await directUpdateUserSubscription(editingUser.id, newTier);
      showMessage(`Paket langganan user ${editingUser.username} berhasil diperbarui.`, 'success');
      setSubscriptionModalOpen(false);
      loadData();
    } catch (err) {
      showMessage('Gagal memperbarui paket langganan user.', 'error');
    }
  };

  const handleApproveRequest = async (id: number) => {
    try {
      await approveSubscriptionRequest(id);
      showMessage('Permintaan upgrade berhasil disetujui.', 'success');
      loadData();
    } catch (err) {
      showMessage('Gagal menyetujui permintaan upgrade.', 'error');
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      await rejectSubscriptionRequest(id);
      showMessage('Permintaan upgrade berhasil ditolak.', 'success');
      loadData();
    } catch (err) {
      showMessage('Gagal menolak permintaan upgrade.', 'error');
    }
  };

  // AI Settings Actions
  const handleAiFormChange = (key: string, value: string) => {
    setAiForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await updateAdminSettings(aiForm);
      showMessage('Konfigurasi AI berhasil disimpan.', 'success');
      loadData();
    } catch (err) {
      showMessage('Gagal menyimpan konfigurasi AI.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Formatting helpers
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 pb-24">
      {/* Toast Alert */}
      {actionMessage && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border transition-all duration-300 transform translate-y-0 ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-500" />
          )}
          <span className="text-xs font-bold">{actionMessage.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Admin Dashboard</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1 pl-13">
            Kelola pengaturan AI, hak akses pengguna, kuota, dan amati riwayat audit aktivitas.
          </p>
        </div>
      </div>

      {/* Glassmorphic Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200 max-w-max">
        {[
          { id: 'stats', label: 'Statistik & Analitik AI', icon: Cpu },
          { id: 'users', label: 'Manajemen Pengguna', icon: Users },
          { id: 'logs', label: 'Log Aktivitas', icon: Activity },
          { id: 'ai', label: 'Konfigurasi AI', icon: Settings2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setLogPage(0);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white text-primary shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Container */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
        {loading && (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {!loading && activeTab === 'stats' && (
          <StatsTab tokenStats={tokenStats} formatDate={formatDate} />
        )}

        {!loading && activeTab === 'users' && (
          <UsersTab
            users={users}
            pendingRequests={pendingRequests}
            formatBytes={formatBytes}
            onOpenQuotaModal={openQuotaModal}
            onOpenAiLimitModal={openAiLimitModal}
            onOpenMigrationLimitModal={openMigrationLimitModal}
            onOpenSubscriptionModal={openSubscriptionModal}
            onToggleStatus={handleToggleStatus}
            onDeleteUser={handleDeleteUser}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        )}

        {!loading && activeTab === 'logs' && (
          <LogsTab
            activities={activities}
            logPage={logPage}
            onPrevPage={() => setLogPage(prev => Math.max(0, prev - 1))}
            onNextPage={() => setLogPage(prev => prev + 1)}
            formatDate={formatDate}
          />
        )}

        {!loading && activeTab === 'ai' && (
          <AiConfigTab
            aiForm={aiForm}
            onFormChange={handleAiFormChange}
            onSave={handleSaveSettings}
            promptAccordionOpen={promptAccordionOpen}
            setPromptAccordionOpen={setPromptAccordionOpen}
          />
        )}
      </div>

      {/* Quota Modification Modal */}
      <QuotaModal
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        username={editingUser?.username || ''}
        quotaValue={newQuotaValue}
        quotaUnit={newQuotaUnit}
        onQuotaValueChange={setNewQuotaValue}
        onQuotaUnitChange={setNewQuotaUnit}
        onSave={handleUpdateQuota}
      />

      {/* AI Daily Limit Modification Modal */}
      <AiLimitModal
        isOpen={aiLimitModalOpen}
        onClose={() => setAiLimitModalOpen(false)}
        username={editingUser?.username || ''}
        limit={newAiLimit}
        onLimitChange={setNewAiLimit}
        onSave={handleUpdateAiLimit}
      />

      {/* Migration Limits Modification Modal */}
      <MigrationLimitModal
        isOpen={migrationLimitModalOpen}
        onClose={() => setMigrationLimitModalOpen(false)}
        username={editingUser?.username || ''}
        dailyLimit={newMigrationDailyLimit}
        maxFileSizeValue={newMigrationMaxSizeValue}
        maxFileSizeUnit={newMigrationMaxSizeUnit}
        onDailyLimitChange={setNewMigrationDailyLimit}
        onMaxFileSizeValueChange={setNewMigrationMaxSizeValue}
        onMaxFileSizeUnitChange={setNewMigrationMaxSizeUnit}
        onSave={handleUpdateMigrationLimits}
      />

      {/* Subscription Tier Modification Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        username={editingUser?.username || ''}
        currentTier={editingUser?.subscriptionTier || 'FREEMIUM'}
        onSave={handleUpdateSubscription}
      />
    </div>
  );
}
