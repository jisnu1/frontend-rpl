import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function Modal({ isOpen, onClose, title, children, icon: Icon }: ModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-[0px_10px_30px_rgba(15,23,42,0.1)] border border-slate-100 m-4 transform scale-100 transition-transform duration-300 z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="text-primary w-5 h-5 shrink-0" />}
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
