import React from 'react';

export default function AiRecapTab({ onTriggerAiConversation }) {
  const takeaways = [
    { id: 1, text: 'APAC expansion is prioritized over EMEA for Q4 budget allocation.', query: 'Why is the APAC expansion prioritized over EMEA?' },
    { id: 2, text: 'Supply chain costs expected to rise 4% before Vietnam facility is fully operational.', query: 'What are the details of the supply chain cost increases and the Vietnam facility?' },
    { id: 3, text: 'Marketing spend shifting heavily towards digital channels in target regions.', query: 'What is the marketing budget allocation strategy for target regions?' },
  ];

  const suggestedActions = [
    { text: 'Schedule Q4 Budget Review', query: 'How should we schedule the Q4 Budget Review based on the report?', icon: 'calendar_add_on' },
    { text: 'Draft email to Logistics Team', query: 'Draft a professional briefing email to the logistics team regarding the Vietnam facility transition.', icon: 'mail' },
  ];

  const keyEntities = [
    { label: 'APAC', query: 'What does the report say about APAC?' },
    { label: 'Vietnam', query: 'What are the details of the Vietnam facility transition?' },
    { label: 'Supply Chain', query: 'Explain the supply chain changes discussed in this document.' },
    { label: 'Q3', query: 'What are the main outcomes and metrics from Q3?' },
    { label: 'Singapore', query: 'What is our business strategy in Singapore?' },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      {/* Quick Summary Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">summarize</span>
          Executive Summary
        </h3>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 text-sm leading-relaxed text-slate-700">
          This report outlines the Q3 pivot towards emerging APAC markets, projecting a 15% revenue increase. Key focus areas include expanding local partnerships in Singapore and restructuring the supply chain logistics out of Vietnam to mitigate upcoming tariff changes.
        </div>
      </section>

      {/* Key Takeaways Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">key</span>
          Key Takeaways
        </h3>
        <div className="space-y-3">
          {takeaways.map((takeaway) => (
            <div
              key={takeaway.id}
              onClick={() => onTriggerAiConversation(takeaway.query)}
              className="flex gap-3 bg-white p-3 rounded-lg border border-slate-200 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer takeaway-item"
            >
              <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                {takeaway.id}
              </div>
              <p className="text-xs font-semibold text-slate-700">{takeaway.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Actions Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">task_alt</span>
          Suggested Actions
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {suggestedActions.map((act, i) => (
            <button
              key={i}
              onClick={() => onTriggerAiConversation(act.query)}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-transparent transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                  {act.icon}
                </span>
                <span className="text-xs font-bold text-slate-700">{act.text}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                arrow_forward
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Key Entities Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">sell</span>
          Key Entities
        </h3>
        <div className="flex flex-wrap gap-2">
          {keyEntities.map((entity) => (
            <button
              key={entity.label}
              onClick={() => onTriggerAiConversation(entity.query)}
              className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {entity.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
