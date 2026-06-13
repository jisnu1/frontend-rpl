import React from 'react';
import { Globe } from 'lucide-react';
import { UserActivity } from '../../../api/admin';

interface LogsTableProps {
  activities: UserActivity[];
  formatDate: (dateStr: string) => string;
}

export default function LogsTable({
  activities,
  formatDate
}: LogsTableProps) {
  return (
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
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                    act.activityType.startsWith('AI')
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : act.activityType.startsWith('UPLOAD')
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : act.activityType.startsWith('DOWNLOAD')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : act.activityType.startsWith('DELETE')
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
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
              <td className="py-3 px-4 font-bold text-slate-500">
                {act.userId ? `ID: ${act.userId}` : 'Anonim'}
              </td>
              <td className="py-3 px-4 text-right text-slate-400 font-semibold">
                {formatDate(act.createdAt)}
              </td>
            </tr>
          ))}
          {activities.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-10 font-bold text-slate-400">
                Tidak ada log aktivitas pengguna.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
