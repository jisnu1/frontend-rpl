import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [activeChart, setActiveChart] = useState('daily'); // daily or weekly

  const metrics = [
    {
      title: 'Total Storage',
      value: '845.2 TB',
      change: '12%',
      isPositive: true,
      time: 'vs last month',
      icon: 'storage',
      bgIcon: 'database',
      color: 'primary',
    },
    {
      title: 'Active Users',
      value: '12,405',
      change: '4.3%',
      isPositive: true,
      time: 'vs last month',
      icon: 'group',
      bgIcon: 'group',
      color: 'indigo',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
      {/* Header Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            Admin Overview
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time status updates and activity logs for storage services.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-level-1 hover-lift flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl">{metric.bgIcon}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-lg flex items-center justify-center ${
                  metric.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <span className="material-symbols-outlined">{metric.icon}</span>
              </div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.title}</h2>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">{metric.value}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5 font-bold">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {metric.change}
                </span>
                <span className="text-slate-500">{metric.time}</span>
              </div>
            </div>
          </div>
        ))}

        {/* System Health */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-level-1 hover-lift flex flex-col relative overflow-hidden border-l-4 border-emerald-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined">health_and_safety</span>
            </div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Health</h2>
          </div>
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
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-level-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Storage Distribution</h2>
            <button className="text-slate-400 hover:text-primary">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div
              className="relative w-40 h-40 rounded-full mb-8 shadow-md"
              style={{
                background:
                  'conic-gradient(#004ac6 0% 45%, #5e6e85 45% 75%, #00174b 75% 90%, #d2d9f4 90% 100%)',
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                <span className="text-sm font-bold text-slate-800">845.2 TB</span>
              </div>
            </div>
            
            <div className="w-full space-y-3 px-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-slate-600">Documents</span>
                </div>
                <span className="font-extrabold text-slate-800">45%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#5e6e85]"></div>
                  <span className="text-slate-600">Media</span>
                </div>
                <span className="font-extrabold text-slate-800">30%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00174b]"></div>
                  <span className="text-slate-600">Backups</span>
                </div>
                <span className="font-extrabold text-slate-800">15%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#d2d9f4]"></div>
                  <span className="text-slate-600">Other</span>
                </div>
                <span className="font-extrabold text-slate-800">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity Trend */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-level-1 lg:col-span-2 flex flex-col">
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

            {/* Labels matching daily layout */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
              <div key={day} className="z-10 flex flex-col items-center gap-2 group w-full relative">
                <span className="text-[10px] text-slate-400 absolute -bottom-6">{day}</span>
              </div>
            ))}
            <div className="z-10 flex flex-col items-center gap-2 group w-full relative">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-primary absolute bottom-[85%] shadow-md animate-pulse"></div>
              <span className="text-[10px] text-primary absolute -bottom-6 font-bold">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Activity List */}
      <div className="bg-white rounded-2xl shadow-level-1 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Recent Alerts &amp; Activity</h2>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
            5 Tasks Auto-Monitored
          </span>
        </div>
        <div className="flex flex-col w-full overflow-x-auto">
          {/* List Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-150 bg-slate-50/30 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[700px]">
            <div className="col-span-5">Event</div>
            <div className="col-span-3">User/System</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* List Items */}
          <div className="min-w-[700px] divide-y divide-slate-100">
            {/* Item 1 (Alert) */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4.5 ghost-row items-center">
              <div className="col-span-5 flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                </div>
                <span className="text-sm font-semibold text-slate-800 truncate">
                  Storage Node B approaching capacity limits
                </span>
              </div>
              <div className="col-span-3 text-sm text-slate-500">System Auto-Monitor</div>
              <div className="col-span-2 text-sm text-slate-400">10 mins ago</div>
              <div className="col-span-2 text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-extrabold uppercase">
                  Critical
                </span>
              </div>
            </div>

            {/* Item 2 (AI File - Interactive Detail Link) */}
            <Link
              to="/recap"
              className="grid grid-cols-12 gap-4 px-6 py-4.5 ghost-row items-center border-l-4 border-primary hover:bg-blue-50/30 group"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold text-primary group-hover:underline truncate flex items-center gap-1.5">
                    Q3 Global Strategy Report.pdf
                    <span className="material-symbols-outlined text-[16px] text-primary/50 group-hover:text-primary transition-colors">
                      open_in_new
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    AI Recap File Analysis Generated successfully
                  </span>
                </div>
              </div>
              <div className="col-span-3 text-sm text-slate-500">Jessica (Admin)</div>
              <div className="col-span-2 text-sm text-slate-400">1 hour ago</div>
              <div className="col-span-2 text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-primary text-[10px] font-extrabold uppercase">
                  AI Analysis
                </span>
              </div>
            </Link>

            {/* Item 3 */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4.5 ghost-row items-center">
              <div className="col-span-5 flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
                <span className="text-sm font-semibold text-slate-800 truncate">
                  Bulk Enterprise User Import Completed
                </span>
              </div>
              <div className="col-span-3 text-sm text-slate-500">Jessica (Admin)</div>
              <div className="col-span-2 text-sm text-slate-400">3 hours ago</div>
              <div className="col-span-2 text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase">
                  Success
                </span>
              </div>
            </div>

            {/* Item 4 */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4.5 ghost-row items-center">
              <div className="col-span-5 flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-[#e0e3e5] text-slate-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">settings_backup_restore</span>
                </div>
                <span className="text-sm font-semibold text-slate-800 truncate">
                  System database daily backup compression
                </span>
              </div>
              <div className="col-span-3 text-sm text-slate-500">System Auto-Cron</div>
              <div className="col-span-2 text-sm text-slate-400">5 hours ago</div>
              <div className="col-span-2 text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase">
                  Routine
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
