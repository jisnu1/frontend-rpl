import React, { useState } from 'react';

export default function UserActivityChart() {
  const [activeChart, setActiveChart] = useState('daily'); // daily or weekly

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-level-1 lg:col-span-2 flex flex-col">
      {/* Header and Toggle Controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">User Activity Trends</h2>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveChart('daily')}
            className={`px-4 py-1 text-xs font-semibold rounded-md transition-all ${
              activeChart === 'daily'
                ? 'bg-white shadow-sm text-primary'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setActiveChart('weekly')}
            className={`px-4 py-1 text-xs font-semibold rounded-md transition-all ${
              activeChart === 'weekly'
                ? 'bg-white shadow-sm text-primary'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Chart Graph Area */}
      <div className="flex-1 relative w-full mt-4 border-l border-b border-slate-200/60 pt-4 pr-2 pb-6 pl-6 flex items-end justify-between min-h-[220px]">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 bottom-4 text-[10px] text-slate-400 flex flex-col justify-between h-full py-4 select-none">
          <span>15k</span>
          <span>10k</span>
          <span>5k</span>
          <span>0</span>
        </div>

        {/* SVG Line Graph */}
        <svg className="absolute inset-0 h-full w-full p-4 pl-6 pb-6" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="gradDaily" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2563EB', stopOpacity: 0 }} />
            </linearGradient>
            <linearGradient id="gradWeekly" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ba1a1a', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ba1a1a', stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {activeChart === 'daily' ? (
            <>
              <path
                d="M0,80 Q10,75 20,70 T40,65 T60,50 T80,35 T100,15"
                fill="none"
                stroke="#2563EB"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              <path
                d="M0,80 Q10,75 20,70 T40,65 T60,50 T80,35 T100,15 L100,100 L0,100 Z"
                fill="url(#gradDaily)"
                opacity="0.15"
              />
            </>
          ) : (
            <>
              <path
                d="M0,60 Q10,50 20,55 T40,40 T60,65 T80,45 T100,5"
                fill="none"
                stroke="#ba1a1a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              <path
                d="M0,60 Q10,50 20,55 T40,40 T60,65 T80,45 T100,5 L100,100 L0,100 Z"
                fill="url(#gradWeekly)"
                opacity="0.15"
              />
            </>
          )}
        </svg>

        {/* X-Axis Labels */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
          <div key={day} className="z-10 flex flex-col items-center gap-2 group w-full relative">
            <span className="text-[10px] text-slate-400 absolute -bottom-6">{day}</span>
          </div>
        ))}
        
        {/* Animated Today Pulse */}
        <div className="z-10 flex flex-col items-center gap-2 group w-full relative">
          <div className="w-3 h-3 rounded-full bg-white border-2 border-primary absolute bottom-[85%] shadow-md animate-pulse"></div>
          <span className="text-[10px] text-primary absolute -bottom-6 font-bold">Today</span>
        </div>
      </div>
    </div>
  );
}
