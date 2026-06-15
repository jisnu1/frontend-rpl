import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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
  { value: 'gemini-1.5-flash', name: 'gemini-1.5-flash', type: 'Gratis' },
  { value: 'gemini-2.5-flash', name: 'gemini-2.5-flash', type: 'Gratis' },
  { value: 'gemini-2.5-flash-lite', name: 'gemini-2.5-flash-lite', type: 'Gratis' }
];

const GROQ_MODELS = [
  { value: 'liquid/lfm-2.5-1.2b-instruct:free', rank: '🥇 1', name: 'liquid/lfm-2.5-1.2b-instruct:free', rpm: '10-20', rpd: '200', limit: '~2.0M' },
  { value: 'nvidia/nemotron-3-nano-30b-a3b:free', rank: '🥈 2', name: 'nvidia/nemotron-3-nano-30b-a3b:free', rpm: '5-10', rpd: '100', limit: '~1.5M' },
  { value: 'poolside/laguna-xs.2:free', rank: '🥉 3', name: 'poolside/laguna-xs.2:free', rpm: '5-10', rpd: '100', limit: '~1.5M' },
  { value: 'openai/gpt-oss-20b:free', rank: '4', name: 'openai/gpt-oss-20b:free', rpm: '10', rpd: '150', limit: '~2.0M' },
  { value: 'openai/gpt-oss-120b:free', rank: '5', name: 'openai/gpt-oss-120b:free', rpm: '5', rpd: '50', limit: '~1.0M' },
  { value: 'liquid/lfm-2.5-1.2b-thinking:free', rank: '6', name: 'liquid/lfm-2.5-1.2b-thinking:free', rpm: '10', rpd: '150', limit: '~1.5M' },
  { value: 'google/gemma-4-31b-it:free', rank: '7', name: 'google/gemma-4-31b-it:free', rpm: '5', rpd: '50', limit: '~1.0M' },
  { value: 'openrouter/free', rank: '8', name: 'openrouter/free (Auto Router)', rpm: '15', rpd: '200', limit: '~2.5M' },
  { value: 'nvidia/nemotron-nano-9b-v2:free', rank: '9', name: 'nvidia/nemotron-nano-9b-v2:free', rpm: '10', rpd: '150', limit: '~2.0M' },
  { value: 'nvidia/nemotron-nano-12b-v2-vl:free', rank: '10', name: 'nvidia/nemotron-nano-12b-v2-vl:free', rpm: '5', rpd: '100', limit: '~1.0M' },
  { value: 'poolside/laguna-m.1:free', rank: '11', name: 'poolside/laguna-m.1:free', rpm: '5', rpd: '50', limit: '~1.0M' },
  { value: 'openrouter/owl-alpha', rank: '12', name: 'openrouter/owl-alpha', rpm: '5', rpd: '50', limit: '~800K' }
];

interface CustomDropdownProps {
  value: string;
  options: any[];
  provider: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomDropdown({ value, options, provider, onChange, placeholder = "-- Pilih Model --" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150 hover:bg-slate-50/50"
      >
        <span className="truncate">
          {selectedOption ? (
            provider === 'gemini' ? (
              <span className="flex items-center gap-1.5">
                <span className="bg-emerald-55 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0">GEMINI</span>
                <span>{selectedOption.name}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                {selectedOption.rank && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] shrink-0 font-extrabold">{selectedOption.rank}</span>}
                <span>{selectedOption.name}</span>
              </span>
            )
          ) : (
            <span className="text-slate-400 font-semibold">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-1.5 focus:outline-none animate-fadeIn">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-xs text-slate-400">Tidak ada model tersedia</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex flex-col gap-1 border-b border-slate-50 last:border-0 ${
                    isSelected ? 'bg-primary/5 text-primary' : 'text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {provider === 'gemini' ? (
                        <>
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0">GEMINI</span>
                          <span>{option.name}</span>
                        </>
                      ) : (
                        <>
                          {option.rank && <span className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[9px] font-extrabold shrink-0">{option.rank}</span>}
                          <span className="truncate">{option.name}</span>
                        </>
                      )}
                    </span>
                    {provider === 'gemini' && option.type && (
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0">{option.type}</span>
                    )}
                  </div>
                  {provider !== 'gemini' && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold text-slate-500">
                      <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">RPM: {option.rpm}</span>
                      <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">RPD: {option.rpd}</span>
                      <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Limit: {option.limit}/bln</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

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
    <div className="border border-slate-250/80 rounded-3xl p-6 bg-slate-50/20 space-y-6 shadow-sm border-slate-200">
      <div className="flex items-center gap-2.5 text-slate-800 font-extrabold border-b border-slate-200/50 pb-3">
        <Icon className="w-5 h-5 text-primary" />
        <span className="text-sm tracking-tight">{title}</span>
      </div>
      
      <div className="space-y-4">
        {/* Tier 1: Primary Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Penyedia Utama (Primary)</label>
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 w-full">
              <button
                type="button"
                onClick={() => onChange(providerKey, 'groq')}
                className={`flex-1 text-center py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  currentProvider === 'groq'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Groq / OpenRouter
              </button>
              <button
                type="button"
                onClick={() => onChange(providerKey, 'gemini')}
                className={`flex-1 text-center py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  currentProvider === 'gemini'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Gemini Native
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Model Utama (Primary)</label>
            <CustomDropdown
              value={formData[modelKey] || ''}
              options={getModelOptions(currentProvider)}
              provider={currentProvider}
              onChange={(val) => onChange(modelKey, val)}
            />
          </div>
        </div>

        {/* Tier 2: Fallback 1 Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Penyedia Fallback 1</label>
            <div className="flex bg-slate-200/50 p-0.5 rounded-xl border border-slate-200/50 w-full">
              <button
                type="button"
                onClick={() => onChange(fallbackProviderKey, 'groq')}
                className={`flex-1 text-center py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  currentFallbackProvider === 'groq'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Groq / OpenRouter
              </button>
              <button
                type="button"
                onClick={() => onChange(fallbackProviderKey, 'gemini')}
                className={`flex-1 text-center py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  currentFallbackProvider === 'gemini'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Gemini Native
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Model Fallback 1</label>
            <CustomDropdown
              value={formData[fallbackModelKey] || ''}
              options={getModelOptions(currentFallbackProvider)}
              provider={currentFallbackProvider}
              onChange={(val) => onChange(fallbackModelKey, val)}
            />
          </div>
        </div>

        {/* Tier 3: Fallback 2 Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Penyedia Fallback 2</label>
            <div className="flex bg-slate-200/50 p-0.5 rounded-xl border border-slate-200/50 w-full">
              <button
                type="button"
                onClick={() => onChange(fallback2ProviderKey, 'groq')}
                className={`flex-1 text-center py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  currentFallback2Provider === 'groq'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Groq / OpenRouter
              </button>
              <button
                type="button"
                onClick={() => onChange(fallback2ProviderKey, 'gemini')}
                className={`flex-1 text-center py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  currentFallback2Provider === 'gemini'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Gemini Native
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Model Fallback 2</label>
            <CustomDropdown
              value={formData[fallback2ModelKey] || ''}
              options={getModelOptions(currentFallback2Provider)}
              provider={currentFallback2Provider}
              onChange={(val) => onChange(fallback2ModelKey, val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
