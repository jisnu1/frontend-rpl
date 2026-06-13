import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Cpu, 
  Activity, 
  Settings2, 
  Database, 
  Lock, 
  Unlock, 
  Edit3, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  XCircle,
  Clock,
  Globe,
  Terminal,
  FileText
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
  AppSetting,
  AdminUserResponse,
  UserActivity,
  AiTokenStats
} from '../../api/admin';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'logs' | 'ai'>('stats');
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [tokenStats, setTokenStats] = useState<AiTokenStats | null>(null);
  
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
        const usersList = await fetchAdminUsers();
        setUsers(usersList);
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

  const openQuotaModal = (user: AdminUserResponse) => {
    setEditingUser(user);
    // Convert current bytes to GB or appropriate unit
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
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
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
          <p className="text-xs font-medium text-slate-500 mt-1 pl-13">Kelola pengaturan AI, hak akses pengguna, kuota, dan amati riwayat audit aktivitas.</p>
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
          <div className="space-y-8 flex-1">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Token Hari Ini</span>
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600"><Clock className="w-4 h-4" /></div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-slate-800">{tokenStats?.todayTotalTokens.toLocaleString('id-ID') || 0}</h3>
                  <p className="text-[10px] text-indigo-600/80 font-bold mt-1">Total token masuk & keluar</p>
                </div>
                <div className="pt-2 border-t border-indigo-100/50 flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Prompt: {tokenStats?.todayInputTokens.toLocaleString('id-ID') || 0}</span>
                  <span>Gen: {tokenStats?.todayOutputTokens.toLocaleString('id-ID') || 0}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Token Bulan Ini</span>
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600"><Database className="w-4 h-4" /></div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-slate-800">{tokenStats?.monthTotalTokens.toLocaleString('id-ID') || 0}</h3>
                  <p className="text-[10px] text-emerald-600/80 font-bold mt-1">Akumulasi penggunaan bulan ini</p>
                </div>
                <div className="pt-2 border-t border-emerald-100/50 flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Prompt: {tokenStats?.monthInputTokens.toLocaleString('id-ID') || 0}</span>
                  <span>Gen: {tokenStats?.monthOutputTokens.toLocaleString('id-ID') || 0}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-50/50 to-violet-100/30 border border-violet-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Status Service AI</span>
                  <div className="p-2 bg-violet-500/10 rounded-xl text-violet-600"><CheckCircle2 className="w-4 h-4" /></div>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-emerald-600">Aktif & Stabil</h3>
                  <p className="text-[10px] text-violet-600/80 font-bold mt-2">Mendukung Groq & Gemini</p>
                </div>
                <div className="pt-2 border-t border-violet-100/50 text-[10px] text-slate-400 font-bold">
                  Batas default request user baru: 5 kali / hari
                </div>
              </div>
            </div>

            {/* Custom Interactive Token Trend Bar Chart */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/40">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-6">Tren Penggunaan Token AI Harian (7 Hari Terakhir)</h3>
              
              {(!tokenStats?.history || tokenStats.history.length === 0) ? (
                <div className="h-60 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                  <FileText className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-bold">Belum ada histori penggunaan token tercatat.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Chart bars */}
                  <div className="flex justify-between items-end h-60 gap-4 px-2 sm:px-6">
                    {tokenStats.history.map((entry, idx) => {
                      const maxVal = Math.max(...tokenStats.history.map(h => h.totalTokens), 1);
                      const heightPercent = (entry.totalTokens / maxVal) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 bg-slate-800 text-white rounded-xl py-2 px-3 text-[10px] font-bold shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 flex flex-col gap-1 border border-slate-700">
                            <span className="text-slate-300">{formatDate(entry.date).split(',')[0]}</span>
                            <span className="text-indigo-400">Total: {entry.totalTokens.toLocaleString('id-ID')}</span>
                            <span className="text-slate-400">Prompt: {entry.inputTokens.toLocaleString('id-ID')}</span>
                            <span className="text-slate-400">Gen: {entry.outputTokens.toLocaleString('id-ID')}</span>
                          </div>

                          {/* Bar Graphic */}
                          <div className="w-full bg-slate-200 rounded-t-lg hover:bg-slate-300 transition-colors h-full flex flex-col justify-end overflow-hidden">
                            <div 
                              className="bg-indigo-500 rounded-t-lg group-hover:bg-indigo-600 transition-all duration-500 shadow-sm shadow-indigo-500/10" 
                              style={{ height: `${Math.max(heightPercent, 2)}%` }}
                            ></div>
                          </div>

                          {/* Label (date short) */}
                          <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                            {entry.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="pt-4 border-t border-slate-200 flex justify-center gap-6 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span>
                      <span>Total Token (Input + Output)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="space-y-4 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Hak Akses</th>
                    <th className="py-3 px-4">Penyimpanan Terpakai</th>
                    <th className="py-3 px-4">Limit AI Harian</th>
                    <th className="py-3 px-4">Pemakaian AI Hari Ini</th>
                    <th className="py-3 px-4 text-center">Status Akun</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{user.fullName || user.username}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${
                              r === 'ADMIN' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{formatBytes(user.usedStorage)}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">dari kuota {formatBytes(user.storageQuota)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{user.aiDailyLimit} kali</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className={`${
                            user.dailyAiRequests >= user.aiDailyLimit ? 'text-rose-600' : 'text-indigo-600'
                          }`}>
                            {user.dailyAiRequests}
                          </span>
                          <span className="text-slate-400">/ {user.aiDailyLimit}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          user.isActive 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {user.isActive ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openQuotaModal(user)}
                            title="Edit Kuota Penyimpanan"
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/50"
                          >
                            <Database className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openAiLimitModal(user)}
                            title="Edit Limit AI Harian"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/50"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Protect self-deactivation */}
                          {user.roles.includes('ADMIN') ? (
                            <div className="w-8 h-8"></div>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              title={user.isActive ? 'Blokir User' : 'Aktifkan User'}
                              className={`p-1.5 rounded-lg border transition-all hover:scale-105 ${
                                user.isActive 
                                  ? 'text-rose-600 border-rose-200 hover:bg-rose-50' 
                                  : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                              }`}
                            >
                              {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'logs' && (
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Tipe Aktivitas</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                          act.activityType.startsWith('AI') 
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                            : act.activityType.startsWith('UPLOAD') 
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : act.activityType.startsWith('DOWNLOAD')
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : act.activityType.startsWith('DELETE')
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-50 text-slate-800 border-slate-200'
                        }`}>
                          {act.activityType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{act.description}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{act.ipAddress || 'unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-500">{act.userId ? `ID: ${act.userId}` : 'Anonim'}</td>
                      <td className="py-3 px-4 text-right text-slate-400 font-semibold">{formatDate(act.createdAt)}</td>
                    </tr>
                  ))}
                  {activities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 font-bold text-slate-400">Tidak ada log aktivitas pengguna.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200/80">
              <button
                disabled={logPage === 0}
                onClick={() => setLogPage(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
              <span className="text-xs font-bold text-slate-500">Halaman {logPage + 1}</span>
              <button
                disabled={activities.length < 20}
                onClick={() => setLogPage(prev => prev + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <span>Selanjutnya</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {!loading && activeTab === 'ai' && (
          <div className="space-y-8 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Service Config */}
              <div className="border border-slate-200/80 rounded-2xl p-6 bg-slate-50/30 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200/50 pb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Pengaturan Summary Service</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Primary Provider</label>
                    <select
                      value={aiForm['ai.summary.primary.provider'] || 'groq'}
                      onChange={(e) => handleAiFormChange('ai.summary.primary.provider', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="groq">Groq / OpenRouter</option>
                      <option value="gemini">Gemini Native</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Primary Model ID</label>
                    <input
                      type="text"
                      value={aiForm['ai.summary.primary.model'] || ''}
                      onChange={(e) => handleAiFormChange('ai.summary.primary.model', e.target.value)}
                      placeholder="Masukkan model ID"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fallback Provider</label>
                    <select
                      value={aiForm['ai.summary.fallback.provider'] || 'gemini'}
                      onChange={(e) => handleAiFormChange('ai.summary.fallback.provider', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="groq">Groq / OpenRouter</option>
                      <option value="gemini">Gemini Native</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fallback Model ID</label>
                    <input
                      type="text"
                      value={aiForm['ai.summary.fallback.model'] || ''}
                      onChange={(e) => handleAiFormChange('ai.summary.fallback.model', e.target.value)}
                      placeholder="Masukkan model ID"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Chat Service Config */}
              <div className="border border-slate-200/80 rounded-2xl p-6 bg-slate-50/30 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200/50 pb-3">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Pengaturan Chat PDF Service</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Primary Provider</label>
                    <select
                      value={aiForm['ai.chat.primary.provider'] || 'groq'}
                      onChange={(e) => handleAiFormChange('ai.chat.primary.provider', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="groq">Groq / OpenRouter</option>
                      <option value="gemini">Gemini Native</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Primary Model ID</label>
                    <input
                      type="text"
                      value={aiForm['ai.chat.primary.model'] || ''}
                      onChange={(e) => handleAiFormChange('ai.chat.primary.model', e.target.value)}
                      placeholder="Masukkan model ID"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fallback Provider</label>
                    <select
                      value={aiForm['ai.chat.fallback.provider'] || 'gemini'}
                      onChange={(e) => handleAiFormChange('ai.chat.fallback.provider', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="groq">Groq / OpenRouter</option>
                      <option value="gemini">Gemini Native</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fallback Model ID</label>
                    <input
                      type="text"
                      value={aiForm['ai.chat.fallback.model'] || ''}
                      onChange={(e) => handleAiFormChange('ai.chat.fallback.model', e.target.value)}
                      placeholder="Masukkan model ID"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quota Settings & Prompt Accordion */}
            <div className="space-y-6">
              {/* Default AI Limit */}
              <div className="border border-slate-200/80 rounded-2xl p-6 bg-slate-50/30 max-w-md space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200/50 pb-3">
                  <Clock className="w-4 h-4 text-violet-600" />
                  <span>Batas AI Harian Default (Sistem)</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Default Global AI Request / Hari</label>
                  <input
                    type="number"
                    value={aiForm['ai.guardrail.user_daily_request_limit'] || '5'}
                    onChange={(e) => handleAiFormChange('ai.guardrail.user_daily_request_limit', e.target.value)}
                    placeholder="Masukkan limit"
                    className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Digunakan sebagai cadangan apabila batas limit individual user bernilai kosong.</p>
                </div>
              </div>

              {/* System Prompt Accordion */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/30">
                <button
                  onClick={() => setPromptAccordionOpen(prev => !prev)}
                  className="w-full flex items-center justify-between p-5 bg-slate-100/40 text-slate-800 font-bold hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    <span>System Prompt Utama (Bahasa Indonesia)</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{promptAccordionOpen ? 'Sembunyikan' : 'Tampilkan'}</span>
                </button>
                
                {promptAccordionOpen && (
                  <div className="p-5 border-t border-slate-200/80 space-y-2 bg-white">
                    <textarea
                      rows={6}
                      value={aiForm['ai.system_prompt'] || ''}
                      onChange={(e) => handleAiFormChange('ai.system_prompt', e.target.value)}
                      placeholder="Masukkan System Prompt Utama..."
                      className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-medium bg-slate-50/20 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary leading-relaxed"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quota Modal */}
      {quotaModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Ubah Kuota Penyimpanan</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Ubah kapasitas total disk space untuk user {editingUser.username}.</p>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuotaValue}
                onChange={(e) => setNewQuotaValue(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <select
                value={newQuotaUnit}
                onChange={(e) => setNewQuotaUnit(e.target.value as any)}
                className="w-24 px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
              >
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateQuota}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Limit Modal */}
      {aiLimitModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Ubah Batas Request AI</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Tentukan batas maksimal pemanggilan AI per hari untuk user {editingUser.username}.</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Request Per Hari</label>
              <input
                type="number"
                value={newAiLimit}
                onChange={(e) => setNewAiLimit(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAiLimitModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateAiLimit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
