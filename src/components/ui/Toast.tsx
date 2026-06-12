import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast, ToastMessage } from '../../context/ToastContext';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-500',
    text: 'text-emerald-800',
    close: 'text-emerald-400 hover:text-emerald-600',
    bar: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    text: 'text-red-800',
    close: 'text-red-400 hover:text-red-600',
    bar: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    text: 'text-blue-800',
    close: 'text-blue-400 hover:text-blue-600',
    bar: 'bg-blue-500',
  },
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: number) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Animate progress bar
    const startTime = Date.now();
    const duration = 4000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);

    // Exit animation before removal
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3700);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out min-w-[320px] max-w-[420px] relative overflow-hidden
        ${colors.bg}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors.icon}`} />
      <p className={`text-xs font-semibold flex-1 leading-relaxed ${colors.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`shrink-0 p-0.5 rounded-md transition-colors ${colors.close}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5">
        <div
          className={`h-full ${colors.bar} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
