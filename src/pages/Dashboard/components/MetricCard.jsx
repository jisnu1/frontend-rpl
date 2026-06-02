import React from 'react';

export default function MetricCard({ metric }) {
  const { title, value, change, time, icon, bgIcon, color } = metric;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-level-1 hover-lift flex flex-col relative overflow-hidden">
      {/* Background Icon Watermark */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-8xl">{bgIcon}</span>
      </div>

      {/* Card Header Icon and Title */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-lg flex items-center justify-center ${
            color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h2>
      </div>

      {/* Card Value and Trend Details */}
      <div className="mt-auto">
        <div className="text-3xl font-extrabold text-slate-900 mb-1">{value}</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5 font-bold">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {change}
          </span>
          <span className="text-slate-500">{time}</span>
        </div>
      </div>
    </div>
  );
}
