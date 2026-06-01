import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Recap() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('recap'); // recap or chat
  const [messages, setMessages] = useState([]);
  const [chatCount, setChatCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatThreadRef = useRef(null);

  // Auto-scroll chat thread to bottom when messages or typing state changes
  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [messages, isTyping, activeTab]);

  // Context-aware knowledge base matching keywords in prompt
  const documentKnowledge = [
    {
      keywords: ["apac", "emea", "budget", "priorit", "prioritas"],
      response: "According to page 1 of the report, the **APAC expansion is prioritized over EMEA for Q4 budget allocations** due to recent tariff shifts and higher SEA regional margins. 24% of the operational growth budget has been redirected from Europe to East Asia."
    },
    {
      keywords: ["vietnam", "logistics", "supply chain", "facility", "consolidation", "tariff", "tarip"],
      response: "To mitigate the **4% maritime tariff cost increases**, procurement has established a new logistics consolidation facility in **Vietnam**. The transition timeline targets full operations by Q4. Delays pose an operational cost exposure of **$45,000 per week**."
    },
    {
      keywords: ["singapore", "partner", "marketing", "digital", "singapura"],
      response: "For **Singapore**, we are expanding local corporate partnerships as enterprise sales anchors. Local launch marketing spend will shift 100% to digital media channels next month to ensure maximum exposure for the ecosystem launch."
    },
    {
      keywords: ["q3", "metric", "result", "revenue", "revenue increase"],
      response: "The Q3 pivot is projecting a **15% net revenue increase** once APAC pipelines stabilize. The core metrics indicate our net margin target remains robust at **38%** if supply-chain consolidation concludes on-time."
    },
    {
      keywords: ["email", "draft", "logistics team", "briefing"],
      response: "Here is a professional email draft for the Logistics Team:\n\n**Subject:** Urgent Briefing: Vietnam Consolidation Transition & Tariff Mitigation\n\n*Dear Logistics & Supply Chain Teams,*\n\n*As finalized in our Q3 Global Strategy Report, please ensure all operational consolidation workflows for the new Vietnam facility are ready for full Q4 activation. As a reminder, any delays beyond the transition timeline expose us to tariffs costing $45k/week. Let's schedule an alignment stand-up tomorrow morning.*\n\n*Best regards,\nJessica*"
    },
    {
      keywords: ["schedule", "review", "budget review", "calendar"],
      response: "I've drafted a Calendar Invitation for your team:\n\n**Title:** Q3 Pivot - Q4 Budget Allocation Review\n**Duration:** 45 minutes (Recommended: Tomorrow, 2:00 PM SGT)\n**Agenda:** Reviewing the 24% growth budget redirection from EMEA to APAC (specifically Singapore partner marketing and Vietnam supply chain logistics operations)."
    }
  ];

  const getAiReply = (question) => {
    const qLower = question.toLowerCase();
    for (const item of documentKnowledge) {
      if (item.keywords.some(kw => qLower.includes(kw))) {
        return item.response;
      }
    }
    return `I analyzed your question regarding: *"${question}"*. According to the Q3 Strategy PDF, our central focus is redirecting 24% of EMEA budgets directly to SEA markets (mainly Singapore and Vietnam nodes) to offset tariff charges and push APAC growth to 15%. Let me know if you need specific numbers on this!`;
  };

  const triggerAiConversation = (questionText) => {
    setActiveTab('chat');
    
    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text: questionText };
    setMessages(prev => [...prev, userMsg]);
    setChatCount(prev => prev + 1);
    
    setIsTyping(true);

    // Simulate small API delay
    setTimeout(() => {
      setIsTyping(false);
      const replyText = getAiReply(questionText);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: replyText };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;
    setInputValue('');
    triggerAiConversation(query);
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full relative">
      {/* Main Document Area */}
      <main className="flex-1 relative bg-surface-container-low overflow-hidden flex justify-center pt-8 px-8">
        {/* Back Link */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-full shadow-sm hover:shadow-md transition-all text-on-surface hover:text-primary border border-surface-variant/50"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="text-sm font-semibold">Back to Overview</span>
          </Link>
        </div>

        {/* The Document Preview Canvas */}
        <div
          className={`w-full bg-surface-container-lowest shadow-[0px_4px_20px_rgba(15,23,42,0.05)] rounded-t-xl border border-surface-variant/50 flex flex-col relative overflow-hidden transition-all duration-300 ${
            isPanelOpen ? 'max-w-[820px]' : 'max-w-5xl'
          }`}
        >
          {/* Document Header */}
          <div className="px-8 py-6 border-b border-surface-variant flex items-center justify-between bg-surface-container-lowest z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-on-surface">Q3 Global Strategy Report.pdf</h1>
                <p className="text-xs text-on-surface-variant mt-1 font-medium">Modified Oct 12, 2023 • 2.4 MB</p>
              </div>
            </div>
            
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

          {/* PDF mock page content */}
          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar relative bg-slate-50">
            <div className="absolute inset-0 document-overlay pointer-events-none z-10"></div>
            
            <div className="max-w-[650px] mx-auto bg-white p-12 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-100 rounded-lg space-y-8 relative">
              
              {/* Header Logo */}
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

              {/* PDF Content */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Executive Summary</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  As we conclude the third quarter, Horizon Global is pivoting its market priorities. Based on recent shifts in trade logistics and local infrastructure growth, we are redirecting 24% of our growth budgets away from European (EMEA) operations and aligning heavily towards the emerging Asia-Pacific (APAC) markets. 
                </p>

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
        </main>

        {/* AI Assistant Side Panel */}
        <aside
          className={`w-[420px] bg-white border-l border-slate-150 h-full flex flex-col shadow-[-10px_0px_30px_rgba(15,23,42,0.03)] z-20 transition-all duration-300 ${
            isPanelOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 top-0 bottom-0 pointer-events-none opacity-0'
          }`}
        >
          {/* Panel Header */}
          <div className="px-6 py-4 flex flex-col gap-3 border-b border-surface-variant/40 bg-surface-container-lowest/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
                  <span className="material-symbols-outlined text-[18px] icon-fill">auto_awesome</span>
                  <span className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20"></span>
                </div>
                <h2 className="text-lg font-extrabold ai-gradient-text">AI Assistant</h2>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors" title="Settings">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </button>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                  title="Close Panel"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Tab selection */}
            <div className="flex border-b border-slate-100 text-xs font-bold">
              <button
                onClick={() => setActiveTab('recap')}
                className={`flex-1 pb-2 text-center transition-all focus:outline-none ${
                  activeTab === 'recap' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Document Recap
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 pb-2 text-center transition-all focus:outline-none ${
                  activeTab === 'chat' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Ask AI{' '}
                <span className="ml-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
                  {chatCount}
                </span>
              </button>
            </div>
          </div>

          {/* Panel Content - Recap Tab */}
          {activeTab === 'recap' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {/* Quick Summary */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">summarize</span>
                  Executive Summary
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 text-sm leading-relaxed text-slate-700">
                  This report outlines the Q3 pivot towards emerging APAC markets, projecting a 15% revenue increase. Key focus areas include expanding local partnerships in Singapore and restructuring the supply chain logistics out of Vietnam to mitigate upcoming tariff changes.
                </div>
              </section>

              {/* Takeaways list */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  Key Takeaways
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 1, text: 'APAC expansion is prioritized over EMEA for Q4 budget allocation.', query: 'Why is the APAC expansion prioritized over EMEA?' },
                    { id: 2, text: 'Supply chain costs expected to rise 4% before Vietnam facility is fully operational.', query: 'What are the details of the supply chain cost increases and the Vietnam facility?' },
                    { id: 3, text: 'Marketing spend shifting heavily towards digital channels in target regions.', query: 'What is the marketing budget allocation strategy for target regions?' },
                  ].map((takeaway) => (
                    <div
                      key={takeaway.id}
                      onClick={() => triggerAiConversation(takeaway.query)}
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

              {/* Actions list */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  Suggested Actions
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { text: 'Schedule Q4 Budget Review', query: 'How should we schedule the Q4 Budget Review based on the report?', icon: 'calendar_add_on' },
                    { text: 'Draft email to Logistics Team', query: 'Draft a professional briefing email to the logistics team regarding the Vietnam facility transition.', icon: 'mail' },
                  ].map((act, i) => (
                    <button
                      key={i}
                      onClick={() => triggerAiConversation(act.query)}
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

              {/* Entity Chips */}
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">sell</span>
                  Key Entities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'APAC', query: 'What does the report say about APAC?' },
                    { label: 'Vietnam', query: 'What are the details of the Vietnam facility transition?' },
                    { label: 'Supply Chain', query: 'Explain the supply chain changes discussed in this document.' },
                    { label: 'Q3', query: 'What are the main outcomes and metrics from Q3?' },
                    { label: 'Singapore', query: 'What is our business strategy in Singapore?' },
                  ].map((entity) => (
                    <button
                      key={entity.label}
                      onClick={() => triggerAiConversation(entity.query)}
                      className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {entity.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Panel Content - Ask AI Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4" ref={chatThreadRef}>
              {/* Default Welcome message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[16px] icon-fill">auto_awesome</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 text-xs font-semibold text-slate-700 max-w-[85%] leading-relaxed">
                  Hello Jessica! I've analyzed **Q3 Global Strategy Report.pdf**. Ask me any specific question about the supply chain pivot, the APAC budget allocations, or Singapore partnerships!
                </div>
              </div>

              {/* Dynamic messages */}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[16px] icon-fill">auto_awesome</span>
                    </div>
                  )}
                  <div
                    className={`rounded-xl p-3.5 text-xs font-semibold max-w-[85%] leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-slate-50 text-slate-700 whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                      J
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Loader */}
              {isTyping && (
                <div className="flex gap-3 items-center text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[16px] icon-fill">auto_awesome</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl py-3 px-4 text-xs italic flex items-center gap-1.5 shadow-sm">
                    <span>AI Assistant is reading report</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel Footer - Chat Input */}
          {activeTab === 'chat' && (
            <div className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={handleFormSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-4 pr-12 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  placeholder="Ask AI about this document..."
                />
                <button
                  type="submit"
                  className="absolute right-2 p-2 rounded-full bg-primary text-white hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </div>
          )}
        </aside>

        {/* Closed Assistant Toggle Button */}
        {!isPanelOpen && (
          <button
            onClick={() => setIsPanelOpen(true)}
            className="absolute right-0 top-24 bg-white rounded-l-xl p-3 shadow-md border border-r-0 border-slate-200 text-primary hover:bg-slate-50 transition-colors z-30 group"
          >
            <span className="material-symbols-outlined animate-pulse group-hover:animate-none">auto_awesome</span>
          </button>
        )}
      </div>
    </div>
  );
}
