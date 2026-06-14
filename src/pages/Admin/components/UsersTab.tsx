import React from 'react';
import UsersTable from './UsersTable';
import { AdminUserResponse } from '../../../api/admin';

interface UsersTabProps {
  users: AdminUserResponse[];
  formatBytes: (bytes: number) => string;
  onOpenQuotaModal: (user: AdminUserResponse) => void;
  onOpenAiLimitModal: (user: AdminUserResponse) => void;
  onOpenMigrationLimitModal: (user: AdminUserResponse) => void;
  onToggleStatus: (user: AdminUserResponse) => void;
}

export default function UsersTab({
  users,
  formatBytes,
  onOpenQuotaModal,
  onOpenAiLimitModal,
  onOpenMigrationLimitModal,
  onToggleStatus
}: UsersTabProps) {
  return (
    <div className="space-y-4 flex-1">
      <UsersTable
        users={users}
        formatBytes={formatBytes}
        onOpenQuotaModal={onOpenQuotaModal}
        onOpenAiLimitModal={onOpenAiLimitModal}
        onOpenMigrationLimitModal={onOpenMigrationLimitModal}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
}
