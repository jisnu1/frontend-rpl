import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Copy, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import MarkdownRenderer from '../../../components/ui/MarkdownRenderer';

interface Message {
  id: string | number;
  sender: 'user' | 'ai';
  text: string;
}

interface AiChatTabProps {
  messages?: Message[];
  isTyping?: boolean;
  onSendQuestion: (query: string) => void;
  fileDetails: any;
}

export default function AiChatTab({ messages = [], isTyping = false, onSendQuestion, fileDetails }: AiChatTabProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const chatThreadRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;
    setInputValue('');
    onSendQuestion(query);
  };

  const handleCopy = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fileName = fileDetails?.originalFileName || 'dokumen ini';
  const username = user?.username || 'User';
  const welcomeText = `Halo ${username}! Saya telah menganalisis **${fileName}**. Silakan ajukan pertanyaan spesifik tentang dokumen ini!`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-white">
      {/* Messages Thread Container */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6" 
        ref={chatThreadRef}
      >
        {/* Welcome Message */}
        <div className="flex gap-4 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-xs font-bold text-slate-700">AI</div>
            <div className="pr-4">
              <MarkdownRenderer text={welcomeText} />
            </div>
            
            {/* Copy button */}
            <div className="pt-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleCopy(welcomeText, 'welcome')}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-50 text-[10px] font-bold text-slate-400 hover:text-slate-650 transition-all border border-slate-100"
              >
                {copiedId === 'welcome' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 shrink-0" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Conversation History */}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-4 group animate-fadeIn">
            {msg.sender === 'ai' ? (
              <>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="text-xs font-bold text-slate-700">AI</div>
                  <div className="pr-4">
                    <MarkdownRenderer text={msg.text} />
                  </div>
                  
                  {/* Copy button */}
                  <div className="pt-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-50 text-[10px] font-bold text-slate-400 hover:text-slate-650 transition-all border border-slate-100"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 shrink-0" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 border border-slate-200">
                  U
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-xs font-bold text-slate-700">You</div>
                  <div className="bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%] text-xs font-medium text-slate-700 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    {msg.text}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* AI Waveform Glowing Loading Pulse */}
        {isTyping && (
          <div className="flex gap-4 items-start animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="text-xs font-bold text-slate-700">AI</div>
              <div className="flex items-center gap-1.5 pl-1 py-1 h-[28px]">
                <div className="gemini-wave-bar"></div>
                <div className="gemini-wave-bar"></div>
                <div className="gemini-wave-bar"></div>
                <div className="gemini-wave-bar"></div>
                <div className="gemini-wave-bar"></div>
                <span className="text-[11px] font-bold text-indigo-500/80 italic ml-2.5 select-none">
                  AI is processing...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Chat Panel Footer */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleFormSubmit} className="relative flex items-center" noValidate>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-12 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-inner"
            placeholder="Ask AI about this document..."
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2 rounded-full bg-primary text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-450 transition-all flex items-center justify-center shadow-md active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
