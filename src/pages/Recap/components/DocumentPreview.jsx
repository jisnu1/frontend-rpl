import React from 'react';

export default function DocumentPreview() {
  return (
    <div className="flex-1 p-12 overflow-y-auto custom-scrollbar relative bg-slate-50">
      {/* Overlay styling for PDF print feel */}
      <div className="absolute inset-0 document-overlay pointer-events-none z-10"></div>
      
      {/* Document Sheet Container */}
      <div className="max-w-[650px] mx-auto bg-white p-12 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-100 rounded-lg space-y-8 relative">
        
        {/* Document Corporate Header */}
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">HORIZON GLOBAL</h2>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Corporate Strategy Group</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-red-600">Confidential</p>
            <p>Report Ref: #Q3-2023-STRAT</p>
          </div>
        </div>

        {/* PDF Page Contents */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Executive Summary</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            As we conclude the third quarter, Horizon Global is pivoting its market priorities. Based on recent shifts in trade logistics and local infrastructure growth, we are redirecting 24% of our growth budgets away from European (EMEA) operations and aligning heavily towards the emerging Asia-Pacific (APAC) markets. 
          </p>

          {/* Core Metrics Stats Box */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <span className="text-xs text-blue-600 font-bold tracking-wider uppercase block">APAC Target Growth</span>
              <span className="text-2xl font-extrabold text-blue-900">+15% Projected</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 font-bold tracking-wider uppercase block">Budget Shift</span>
              <span className="text-2xl font-extrabold text-slate-800">24% Redirected</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800">Supply Chain Restructuring</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            With the introduction of the new maritime trade tariffs, logistics routes out of traditional coastal hubs are projected to experience an immediate 4% rise in operational costs. To mitigate this margin degradation, our engineering and procurement teams have finalized details for the new logistics consolidation center in Vietnam. Transition timelines suggest the Vietnam node will be fully operational by Q4.
          </p>

          {/* Key Quote blockquote */}
          <blockquote className="border-l-4 border-primary pl-4 py-1 my-4 italic text-sm text-slate-700 bg-slate-50 rounded-r-md">
            "The restructuring of supply chains out of Vietnam is vital to maintain our 38% net margin targets. Any delays in the transition will result in a weekly cost exposure of approximately $45k."
          </blockquote>

          <h3 className="text-lg font-bold text-slate-800">Singapore Commercial Partnerships</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our commercial launch in Singapore will serve as the enterprise sales anchor for the wider SEA region. Local marketing spend will be shifting aggressively to digital channels starting next month to ensure maximum engagement for the partner ecosystem showcase.
          </p>
        </div>

      </div>
    </div>
  );
}
