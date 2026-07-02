import React from 'react';
import { Download } from 'lucide-react';
import LogsTable from './LogsTable';
import Pagination from './Pagination';
import { UserActivity } from '../../../api/admin';

interface LogsTabProps {
  activities: UserActivity[];
  logPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  formatDate: (dateStr: string) => string;
  onDownloadCsv: () => void;
}

export default function LogsTab({
  activities,
  logPage,
  onPrevPage,
  onNextPage,
  formatDate,
  onDownloadCsv
}: LogsTabProps) {
  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Logs Header & Download */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800">Log Aktivitas Pengguna</h3>
        <button
          onClick={onDownloadCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download CSV</span>
        </button>
      </div>

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
