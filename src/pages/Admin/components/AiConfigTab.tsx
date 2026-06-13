import React from 'react';
import { FileText, Activity, Clock, Save } from 'lucide-react';
import ServiceConfigCard from './ServiceConfigCard';
import PromptAccordion from './PromptAccordion';

interface AiConfigTabProps {
  aiForm: Record<string, string>;
  onFormChange: (key: string, value: string) => void;
  onSave: () => void;
  promptAccordionOpen: boolean;
  setPromptAccordionOpen: (open: boolean) => void;
}

export default function AiConfigTab({
  aiForm,
  onFormChange,
  onSave,
  promptAccordionOpen,
  setPromptAccordionOpen
}: AiConfigTabProps) {
  return (
    <div className="space-y-8 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Service Config */}
        <ServiceConfigCard
          title="Pengaturan Summary Service"
          icon={FileText}
          providerKey="ai.summary.primary.provider"
          modelKey="ai.summary.primary.model"
          fallbackProviderKey="ai.summary.fallback.provider"
          fallbackModelKey="ai.summary.fallback.model"
          formData={aiForm}
          onChange={onFormChange}
        />

        {/* Chat Service Config */}
        <ServiceConfigCard
          title="Pengaturan Chat PDF Service"
          icon={Activity}
          providerKey="ai.chat.primary.provider"
          modelKey="ai.chat.primary.model"
          fallbackProviderKey="ai.chat.fallback.provider"
          fallbackModelKey="ai.chat.fallback.model"
          formData={aiForm}
          onChange={onFormChange}
        />
      </div>

      {/* Quota Settings & Prompt Accordion */}
      <div className="space-y-6">
        {/* Default AI Limit */}
        <div className="border border-slate-200/80 rounded-2xl p-6 bg-slate-50/30 max-w-md space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200/50 pb-3">
            <Clock className="w-4 h-4 text-violet-600" />
            <span>Batas AI Harian Default (Sistem)</span>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Default Global AI Request / Hari
            </label>
            <input
              type="number"
              value={aiForm['ai.guardrail.user_daily_request_limit'] || '5'}
              onChange={(e) => onFormChange('ai.guardrail.user_daily_request_limit', e.target.value)}
              placeholder="Masukkan limit"
              className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              Digunakan sebagai cadangan apabila batas limit individual user bernilai kosong.
            </p>
          </div>
        </div>

        {/* System Prompt Accordion */}
        <PromptAccordion
          value={aiForm['ai.system_prompt'] || ''}
          onChange={(val) => onFormChange('ai.system_prompt', val)}
          isOpen={promptAccordionOpen}
          onToggle={() => setPromptAccordionOpen(!promptAccordionOpen)}
        />
      </div>

      {/* Save Buttons */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Pengaturan</span>
        </button>
      </div>
    </div>
  );
}
