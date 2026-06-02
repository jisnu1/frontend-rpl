import React from 'react';

export default function SystemHealthCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-level-1 hover-lift flex flex-col relative overflow-hidden border-l-4 border-emerald-500">
      {/* Icon and Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 flex items-center justify-center">
          <span className="material-symbols-outlined">health_and_safety</span>
        </div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Health</h2>
      </div>

      {/* Values & Live Animated Pulses */}
      <div className="mt-auto">
        <div className="text-3xl font-extrabold text-slate-900 mb-1">99.99%</div>
        <div className="text-xs text-slate-500">Uptime across all nodes</div>
        
        {/* Animated Pulses */}
        <div className="mt-4 flex gap-1.5">
          <div className="h-1 flex-1 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="h-1 flex-1 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-1 flex-1 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-1 flex-1 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="h-1 flex-1 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
