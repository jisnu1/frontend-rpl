import React from 'react';

export default function StorageDistributionChart() {
  const distributionItems = [
    { name: 'Documents', percentage: '45%', colorClass: 'bg-primary' },
    { name: 'Media', percentage: '30%', colorClass: 'bg-[#5e6e85]' },
    { name: 'Backups', percentage: '15%', colorClass: 'bg-[#00174b]' },
    { name: 'Other', percentage: '10%', colorClass: 'bg-[#d2d9f4]' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-level-1 flex flex-col">
      {/* Chart Title and Header Options */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">Storage Distribution</h2>
        <button className="text-slate-400 hover:text-primary">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Chart Circle and Legend */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {/* Conic-Gradient Mock Pie Chart */}
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
        
        {/* Chart Legend */}
        <div className="w-full space-y-3 px-2">
          {distributionItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.colorClass}`}></div>
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-extrabold text-slate-800">{item.percentage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
