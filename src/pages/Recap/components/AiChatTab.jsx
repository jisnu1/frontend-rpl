import React, { useState, useRef, useEffect } from 'react';

export default function AiChatTab({ messages = [], isTyping = false, onSendQuestion }) {
  const [inputValue, setInputValue] = useState('');
  const chatThreadRef = useRef(null);

  // Scroll otomatis thread obrolan ke baris terbawah ketika pesan atau status mengetik berubah
  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;
    setInputValue('');
    onSendQuestion(query);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Messages Thread Container */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4" 
        ref={chatThreadRef}
      >
        {/* Welcome Message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[16px] icon-fill">auto_awesome</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 text-xs font-semibold text-slate-700 max-w-[85%] leading-relaxed">
            Hello Jessica! I've analyzed **Q3 Global Strategy Report.pdf**. Ask me any specific question about the supply chain pivot, the APAC budget allocations, or Singapore partnerships!
          </div>
        </div>

        {/* Conversation History */}
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

        {/* Typing Loader Indicator */}
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

      {/* Input Chat Panel Footer */}
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
    </div>
  );
}
