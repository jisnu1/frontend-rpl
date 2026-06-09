import React from 'react';

export default function DocumentHeader() {
  return (
    <div className="px-8 py-6 border-b border-surface-variant flex items-center justify-between bg-surface-container-lowest z-10 sticky top-0">
      {/* File Info */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">description</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-on-surface">Q3 Global Strategy Report.pdf</h1>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">Modified Oct 12, 2023 • 2.4 MB</p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors" title="Share">
          <span className="material-symbols-outlined">share</span>
        </button>
        <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors" title="Download">
          <span className="material-symbols-outlined">download</span>
        </button>
        <button className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors" title="More">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
    </div>
  );
}
