import React from 'react';
import LogsTable from './LogsTable';
import Pagination from './Pagination';
import { UserActivity } from '../../../api/admin';

interface LogsTabProps {
  activities: UserActivity[];
  logPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  formatDate: (dateStr: string) => string;
}

export default function LogsTab({
  activities,
  logPage,
  onPrevPage,
  onNextPage,
  formatDate
}: LogsTabProps) {
  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <LogsTable activities={activities} formatDate={formatDate} />
      
      <Pagination
        currentPage={logPage}
        onPrev={onPrevPage}
        onNext={onNextPage}
        disablePrev={logPage === 0}
        disableNext={activities.length < 20}
      />
    </div>
  );
}
