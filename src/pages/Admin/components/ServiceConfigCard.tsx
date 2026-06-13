import React from 'react';

interface ServiceConfigCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  providerKey: string;
  modelKey: string;
  fallbackProviderKey: string;
  fallbackModelKey: string;
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function ServiceConfigCard({
  title,
  icon: Icon,
  providerKey,
  modelKey,
  fallbackProviderKey,
  fallbackModelKey,
  formData,
  onChange
}: ServiceConfigCardProps) {
  return (
    <div className="border border-slate-200/80 rounded-2xl p-6 bg-slate-50/30 space-y-4">
      <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200/50 pb-3">
        <Icon className="w-4 h-4 text-primary" />
        <span>{title}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Primary Provider</label>
          <select
            value={formData[providerKey] || 'groq'}
            onChange={(e) => onChange(providerKey, e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="groq">Groq / OpenRouter</option>
            <option value="gemini">Gemini Native</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Primary Model ID</label>
          <input
            type="text"
            value={formData[modelKey] || ''}
            onChange={(e) => onChange(modelKey, e.target.value)}
            placeholder="Masukkan model ID"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fallback Provider</label>
          <select
            value={formData[fallbackProviderKey] || 'gemini'}
            onChange={(e) => onChange(fallbackProviderKey, e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="groq">Groq / OpenRouter</option>
            <option value="gemini">Gemini Native</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fallback Model ID</label>
          <input
            type="text"
            value={formData[fallbackModelKey] || ''}
            onChange={(e) => onChange(fallbackModelKey, e.target.value)}
            placeholder="Masukkan model ID"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
