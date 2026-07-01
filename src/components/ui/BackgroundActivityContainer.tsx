import React from 'react';
import { UploadCloud, DownloadCloud, CheckCircle2, AlertTriangle, FileUp, FileDown, X } from 'lucide-react';
import { useActivity, BackgroundActivity } from '../../context/ActivityContext';

function ActivityItem({ act }: { act: BackgroundActivity }) {
  const { cancelActivity } = useActivity();
  const isUpload = act.type === 'upload';
  const isSuccess = act.status === 'success';
  const isError = act.status === 'error';

  // Dynamic Styles
  const statusColors = {
    running: {
      bg: 'bg-white border-slate-150',
      iconBg: 'bg-indigo-50 text-indigo-600',
      progressBar: 'bg-indigo-600',
      text: 'text-slate-800',
      progressText: 'text-indigo-600',
    },
    success: {
      bg: 'bg-emerald-50/90 border-emerald-200 backdrop-blur-sm',
      iconBg: 'bg-emerald-100 text-emerald-600',
      progressBar: 'bg-emerald-500',
      text: 'text-emerald-950',
      progressText: 'text-emerald-600',
    },
    error: {
      bg: 'bg-red-50/90 border-red-200 backdrop-blur-sm',
      iconBg: 'bg-red-100 text-red-600',
      progressBar: 'bg-red-500',
      text: 'text-red-950',
      progressText: 'text-red-600',
    }
  };

  const style = statusColors[act.status];
  const Icon = isUpload ? FileUp : FileDown;

  return (
    <div
      className={`
        w-80 p-4 rounded-2xl border shadow-lg transition-all duration-300 ease-out flex flex-col gap-3 relative overflow-hidden
        ${style.bg}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Animated loader ring for active tasks */}
        <div className={`p-2 rounded-xl shrink-0 ${style.iconBg} relative`}>
          {act.status === 'running' && (
            <span className="absolute inset-0 rounded-xl border border-indigo-400 animate-ping opacity-25"></span>
          )}
          {isSuccess ? (
            <CheckCircle2 className="w-4.5 h-4.5" />
          ) : isError ? (
            <AlertTriangle className="w-4.5 h-4.5" />
          ) : (
            <Icon className="w-4.5 h-4.5" />
          )}
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isSuccess ? 'text-emerald-600' : isError ? 'text-red-600' : 'text-slate-400'}`}>
            {isUpload ? 'Uploading File' : 'Downloading File'}
          </p>
          <p className={`text-xs font-bold truncate ${style.text}`} title={act.name}>
            {act.name}
          </p>
        </div>

        {/* Progress Percentage */}
        <div className="shrink-0 text-right flex items-center gap-1.5">
          <span className={`text-xs font-black ${style.progressText}`}>{act.progress}%</span>
          {act.status === 'running' && (
            <button
              onClick={() => cancelActivity(act.id)}
              className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-slate-100"
              title="Batalkan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar or Error Message */}
      {isError ? (
        <p className="text-[10px] font-bold text-red-600 truncate leading-none">
          {act.errorMessage || 'Proses gagal dilakukan.'}
        </p>
      ) : (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${style.progressBar} transition-all duration-100 ease-out`}
            style={{ width: `${act.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BackgroundActivityContainer() {
  const { activities } = useActivity();
  const visibleActivities = activities.filter(act => act.type === 'upload' || act.type === 'download');

  if (visibleActivities.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-[9998] flex flex-col gap-3 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar pointer-events-auto">
      {visibleActivities.map((act) => (
        <ActivityItem key={act.id} act={act} />
      ))}
    </div>
  );
}
