import React from 'react';

interface ServiceConfigCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  providerKey: string;
  modelKey: string;
  fallbackProviderKey: string;
  fallbackModelKey: string;
  fallback2ProviderKey: string;
  fallback2ModelKey: string;
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const GEMINI_MODELS = [
  { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash (Gratis)' },
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Gratis)' },
  { value: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (Gratis)' }
];

const GROQ_MODELS = [
  { value: 'liquid/lfm-2.5-1.2b-instruct:free', label: '🥇 1 | liquid/lfm-2.5-1.2b-instruct:free | RPM: 10-20 | RPD: 200 | Limit: ~2.0M tokens/bln' },
  { value: 'nvidia/nemotron-3-nano-30b-a3b:free', label: '🥈 2 | nvidia/nemotron-3-nano-30b-a3b:free | RPM: 5-10 | RPD: 100 | Limit: ~1.5M tokens/bln' },
  { value: 'poolside/laguna-xs.2:free', label: '🥉 3 | poolside/laguna-xs.2:free | RPM: 5-10 | RPD: 100 | Limit: ~1.5M tokens/bln' },
  { value: 'openai/gpt-oss-20b:free', label: '4 | openai/gpt-oss-20b:free | RPM: 10 | RPD: 150 | Limit: ~2.0M tokens/bln' },
  { value: 'openai/gpt-oss-120b:free', label: '5 | openai/gpt-oss-120b:free | RPM: 5 | RPD: 50 | Limit: ~1.0M tokens/bln' },
  { value: 'liquid/lfm-2.5-1.2b-thinking:free', label: '6 | liquid/lfm-2.5-1.2b-thinking:free | RPM: 10 | RPD: 150 | Limit: ~1.5M tokens/bln' },
  { value: 'google/gemma-4-31b-it:free', label: '7 | google/gemma-4-31b-it:free | RPM: 5 | RPD: 50 | Limit: ~1.0M tokens/bln' },
  { value: 'openrouter/free', label: '8 | openrouter/free (Auto Router) | RPM: 15 | RPD: 200 | Limit: ~2.5M tokens/bln' },
  { value: 'nvidia/nemotron-nano-9b-v2:free', label: '9 | nvidia/nemotron-nano-9b-v2:free | RPM: 10 | RPD: 150 | Limit: ~2.0M tokens/bln' },
  { value: 'nvidia/nemotron-nano-12b-v2-vl:free', label: '10 | nvidia/nemotron-nano-12b-v2-vl:free | RPM: 5 | RPD: 100 | Limit: ~1.0M tokens/bln' },
  { value: 'poolside/laguna-m.1:free', label: '11 | poolside/laguna-m.1:free | RPM: 5 | RPD: 50 | Limit: ~1.0M tokens/bln' },
  { value: 'openrouter/owl-alpha', label: '12 | openrouter/owl-alpha | RPM: 5 | RPD: 50 | Limit: ~800K tokens/bln' }
];

export default function ServiceConfigCard({
  title,
  icon: Icon,
  providerKey,
  modelKey,
  fallbackProviderKey,
  fallbackModelKey,
  fallback2ProviderKey,
  fallback2ModelKey,
  formData,
  onChange
}: ServiceConfigCardProps) {

  const getModelOptions = (provider: string) => {
    return provider === 'gemini' ? GEMINI_MODELS : GROQ_MODELS;
  };

  const currentProvider = formData[providerKey] || 'groq';
  const currentFallbackProvider = formData[fallbackProviderKey] || 'groq';
  const currentFallback2Provider = formData[fallback2ProviderKey] || 'groq';

  return (
    <div className="border border-slate-200/80 rounded-2xl p-6 bg-slate-50/30 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200/50 pb-3">
        <Icon className="w-4 h-4 text-primary" />
        <span>{title}</span>
      </div>
      
      <div className="space-y-4">
        {/* Tier 1: Primary Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200/50">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Penyedia Utama (Primary)</label>
            <select
              value={currentProvider}
              onChange={(e) => onChange(providerKey, e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="groq">Groq / OpenRouter</option>
              <option value="gemini">Gemini Native</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Model Utama (Primary)</label>
            <select
              value={formData[modelKey] || ''}
              onChange={(e) => onChange(modelKey, e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="" disabled>-- Pilih Model --</option>
              {getModelOptions(currentProvider).map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tier 2: Fallback 1 Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-100/40 p-4 rounded-xl border border-slate-200/30">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Penyedia Fallback 1</label>
            <select
              value={currentFallbackProvider}
              onChange={(e) => onChange(fallbackProviderKey, e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="groq">Groq / OpenRouter</option>
              <option value="gemini">Gemini Native</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Model Fallback 1</label>
            <select
              value={formData[fallbackModelKey] || ''}
              onChange={(e) => onChange(fallbackModelKey, e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="" disabled>-- Pilih Model --</option>
              {getModelOptions(currentFallbackProvider).map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tier 3: Fallback 2 Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-100/40 p-4 rounded-xl border border-slate-200/30">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Penyedia Fallback 2</label>
            <select
              value={currentFallback2Provider}
              onChange={(e) => onChange(fallback2ProviderKey, e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="groq">Groq / OpenRouter</option>
              <option value="gemini">Gemini Native</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Model Fallback 2</label>
            <select
              value={formData[fallback2ModelKey] || ''}
              onChange={(e) => onChange(fallback2ModelKey, e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="" disabled>-- Pilih Model --</option>
              {getModelOptions(currentFallback2Provider).map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
