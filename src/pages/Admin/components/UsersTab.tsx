import React from 'react';
import UsersTable from './UsersTable';
import { AdminUserResponse } from '../../../api/admin';
import { SubscriptionRequest } from '../../../types/auth.types';

interface UsersTabProps {
  users: AdminUserResponse[];
  pendingRequests: SubscriptionRequest[];
  formatBytes: (bytes: number) => string;
  onOpenQuotaModal: (user: AdminUserResponse) => void;
  onOpenAiLimitModal: (user: AdminUserResponse) => void;
  onOpenMigrationLimitModal: (user: AdminUserResponse) => void;
  onOpenSubscriptionModal: (user: AdminUserResponse) => void;
  onToggleStatus: (user: AdminUserResponse) => void;
  onApproveRequest: (id: number) => void;
  onRejectRequest: (id: number) => void;
}

export default function UsersTab({
  users,
  pendingRequests,
  formatBytes,
  onOpenQuotaModal,
  onOpenAiLimitModal,
  onOpenMigrationLimitModal,
  onOpenSubscriptionModal,
  onToggleStatus,
  onApproveRequest,
  onRejectRequest
}: UsersTabProps) {
  return (
    <div className="space-y-6 flex-1">
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Permintaan Upgrade</h3>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {pendingRequests.length} Menunggu
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((req) => {
              const reqUser = users.find(u => u.id === req.userId);
              return (
                <div key={req.id} className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{reqUser?.username || `User ID: ${req.userId}`}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">{reqUser?.email}</div>
                    <div className="mt-3">
                      <span className={`text-[10px] font-black border px-2.5 py-1 rounded-full uppercase tracking-wider transition-all ${
                        req.requestedTier === 'PREMIUM_INDIVIDUAL'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm shadow-amber-50'
                          : 'bg-cyan-50 text-cyan-800 border-cyan-300 shadow-sm shadow-cyan-50'
                      }`}>
                        {req.requestedTier === 'PREMIUM_INDIVIDUAL' ? 'Premium Individual' : 'Premium Academic'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="px-3 py-1.5 text-[10px] font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => onApproveRequest(req.id)}
                      className="px-3 py-1.5 text-[10px] font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-colors"
                    >
                      Setujui
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <UsersTable
        users={users}
        formatBytes={formatBytes}
        onOpenQuotaModal={onOpenQuotaModal}
        onOpenAiLimitModal={onOpenAiLimitModal}
        onOpenMigrationLimitModal={onOpenMigrationLimitModal}
        onOpenSubscriptionModal={onOpenSubscriptionModal}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
}
