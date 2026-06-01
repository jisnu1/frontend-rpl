import React, { useState, useEffect } from 'react';

export default function UploadModal({ isOpen, onClose }) {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, complete
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setUploadState('idle');
      setProgress(0);
    }
  }, [isOpen]);

  const startSimulation = () => {
    setUploadState('uploading');
    setProgress(0);
  };

  useEffect(() => {
    let interval;
    if (uploadState === 'uploading') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadState('complete');
            }, 400);
            return 100;
          }
          return prev + 5;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [uploadState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-level-2 border border-slate-100 m-4 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">cloud_upload</span>
            <h3 className="text-lg font-bold text-slate-900">Upload New File</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4">
          {/* Idle Drag & Drop Zone */}
          {uploadState === 'idle' && (
            <div 
              onClick={startSimulation}
              className="border-2 border-dashed border-slate-200 hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 group"
            >
              <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors mb-2">
                upload_file
              </span>
              <p className="text-sm font-bold text-slate-850">Drag and drop file here</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, PNG, or ZIP up to 50MB</p>
              <button className="mt-4 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                Browse Files
              </button>
            </div>
          )}

          {/* Uploading State */}
          {uploadState === 'uploading' && (
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">description</span>
                  Q4 Marketing Plan.pdf
                </span>
                <span className="font-semibold text-slate-500">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-100 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 italic">Processing metadata and security scan...</p>
            </div>
          )}

          {/* Complete State */}
          {uploadState === 'complete' && (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <span className="material-symbols-outlined text-5xl text-emerald-500 icon-fill animate-bounce">
                  check_circle
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Upload Complete!</h4>
                <p className="text-xs text-slate-500 mt-1">File uploaded and cached safely.</p>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
