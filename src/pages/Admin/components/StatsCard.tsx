import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'indigo' | 'emerald' | 'violet';
  footer: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  footer
}: StatsCardProps) {
  const colorClasses = {
    indigo: {
      bg: 'from-indigo-50/50 to-indigo-100/30',
      border: 'border-indigo-100',
      textTitle: 'text-indigo-700',
      iconBg: 'bg-indigo-500/10',
      iconText: 'text-indigo-600',
      subText: 'text-indigo-600/80',
      borderFooter: 'border-indigo-100/50'
    },
    emerald: {
      bg: 'from-emerald-50/50 to-emerald-100/30',
      border: 'border-emerald-100',
      textTitle: 'text-emerald-700',
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-600',
      subText: 'text-emerald-600/80',
      borderFooter: 'border-emerald-100/50'
    },
    violet: {
      bg: 'from-violet-50/50 to-violet-100/30',
      border: 'border-violet-100',
      textTitle: 'text-violet-700',
      iconBg: 'bg-violet-500/10',
      iconText: 'text-violet-600',
      subText: 'text-violet-600/80',
      borderFooter: 'border-violet-100/50'
    }
  };

  const current = colorClasses[color] || colorClasses.indigo;

  return (
    <div className={`bg-gradient-to-br ${current.bg} border ${current.border} rounded-2xl p-5 shadow-sm space-y-4`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${current.textTitle} uppercase tracking-wider`}>{title}</span>
        <div className={`p-2 ${current.iconBg} rounded-xl ${current.iconText}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{value}</h3>
        <p className={`text-[10px] ${current.subText} font-bold mt-1`}>{subtitle}</p>
      </div>
      <div className={`pt-2 border-t ${current.borderFooter}`}>
        {footer}
      </div>
    </div>
  );
}
