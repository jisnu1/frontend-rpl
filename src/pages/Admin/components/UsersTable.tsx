import React from 'react';
import { Database, Cpu, Lock, Unlock, RefreshCw, CreditCard } from 'lucide-react';
import { AdminUserResponse } from '../../../api/admin';

interface UsersTableProps {
  users: AdminUserResponse[];
  formatBytes: (bytes: number) => string;
  onOpenQuotaModal: (user: AdminUserResponse) => void;
  onOpenAiLimitModal: (user: AdminUserResponse) => void;
  onOpenMigrationLimitModal: (user: AdminUserResponse) => void;
  onOpenSubscriptionModal: (user: AdminUserResponse) => void;
  onToggleStatus: (user: AdminUserResponse) => void;
}

export default function UsersTable({
  users,
  formatBytes,
  onOpenQuotaModal,
  onOpenAiLimitModal,
  onOpenMigrationLimitModal,
  onOpenSubscriptionModal,
  onToggleStatus
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">Pengguna</th>
            <th className="py-3 px-4">Hak Akses</th>
            <th className="py-3 px-4">Paket</th>
            <th className="py-3 px-4">Penyimpanan Terpakai</th>
            <th className="py-3 px-4">Limit AI Harian</th>
            <th className="py-3 px-4">Limit Migrasi</th>
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
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${
                        r === 'ADMIN'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                    user.subscriptionTier === 'PREMIUM_INDIVIDUAL'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm shadow-amber-100'
                      : user.subscriptionTier === 'PREMIUM_ACADEMIC'
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-300 shadow-sm shadow-cyan-100'
                      : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}>
                    {user.subscriptionTier === 'PREMIUM_INDIVIDUAL'
                      ? 'Premium Individual'
                      : user.subscriptionTier === 'PREMIUM_ACADEMIC'
                      ? 'Premium Academic'
                      : 'Freemium'}
                  </span>
                  {user.subscriptionExpiresAt && (
                    <span className="text-[8px] text-slate-400 mt-0.5 font-bold">
                      Exp: {new Date(user.subscriptionExpiresAt).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{formatBytes(user.usedStorage)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    dari kuota {formatBytes(user.storageQuota)}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 font-bold text-slate-800">{user.aiDailyLimit} kali</td>
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">
                    {user.migrationDailyLimit != null ? user.migrationDailyLimit : 3} kali/hari
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Maks {formatBytes(user.migrationMaxFileSize != null ? user.migrationMaxFileSize : 268435456)}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    user.isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  ></span>
                  {user.isActive ? 'Aktif' : 'Non-aktif'}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onOpenQuotaModal(user)}
                    title="Edit Kuota Penyimpanan"
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/50"
                  >
                    <Database className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenAiLimitModal(user)}
                    title="Edit Limit AI Harian"
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/50"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenMigrationLimitModal(user)}
                    title="Edit Limit Migrasi"
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenSubscriptionModal(user)}
                    title="Ubah Paket Langganan"
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/50"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                  </button>

                  {/* Protect self-deactivation */}
                  {user.roles.includes('ADMIN') ? (
                    <div className="w-8 h-8"></div>
                  ) : (
                    <button
                      onClick={() => onToggleStatus(user)}
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
  );
}
