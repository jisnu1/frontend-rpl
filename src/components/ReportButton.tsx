import React, { useState, useEffect, useRef } from 'react';

export default function ReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    // Mock API call to simulate sending report
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      setMessage('');
      
      // Auto close success message after 2.5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" ref={popoverRef}>
      {/* Popover Feedback Form */}
      {isOpen && (
        <div className="mb-4 w-80 rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 scale-100 origin-bottom-right">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-blue-600 font-semibold">bug_report</span>
              <h3 className="font-bold text-slate-800 text-sm">Report an Issue</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {isSuccess ? (
            <div className="py-6 text-center flex flex-col items-center justify-center space-y-2 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 animate-bounce">
                <span className="material-symbols-outlined text-2xl font-bold">check</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">Report Sent Successfully!</p>
              <p className="text-xs text-slate-500">Thank you for helping us improve Horizon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">What went wrong?</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue or feedback..."
                  rows={3}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                  isSending || !message.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 active:scale-95'
                }`}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating Action Button with Antigravity animations */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="antigravity-btn w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white cursor-pointer select-none transition-all outline-none"
        title="Report an Issue"
      >
        <span className="material-symbols-outlined text-2xl font-bold transition-transform duration-500 hover:rotate-12">
          {isOpen ? 'close' : 'help'}
        </span>
      </button>
    </div>
  );
}
