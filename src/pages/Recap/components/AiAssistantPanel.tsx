import React from 'react';
import { Sparkles, Sliders, X } from 'lucide-react';
import AiRecapTab from './AiRecapTab';
import AiChatTab from './AiChatTab';

interface Message {
  id: string | number;
  sender: 'user' | 'ai';
  text: string;
}

interface AiAssistantPanelProps {
  isPanelOpen: boolean;
  onClosePanel: () => void;
  onOpenPanel: () => void;
  activeTab: 'recap' | 'chat';
  onTabChange: (tab: 'recap' | 'chat') => void;
  messages: Message[];
  isTyping: boolean;
  onSendQuestion: (query: string) => void;
  onTriggerAiConversation: (query: string) => void;
  fileDetails: any;
  summary: string;
  isSummaryLoading: boolean;
}

export default function AiAssistantPanel({
  isPanelOpen,
  onClosePanel,
  onOpenPanel,
  activeTab,
  onTabChange,
  messages,
  isTyping,
  onSendQuestion,
  onTriggerAiConversation,
  fileDetails,
  summary,
  isSummaryLoading,
}: AiAssistantPanelProps) {
  // Count user messages
  const chatCount = messages.filter((msg) => msg.sender === 'user').length;

  if (!isPanelOpen) {
    return (
      <div className="fixed right-6 bottom-8 z-50 flex items-center justify-center pointer-events-auto">
        {isSummaryLoading ? (
          <div className="relative flex items-center justify-center w-16 h-16">
            {/* Spinning gradient border ring */}
            <svg className="animate-spin w-16 h-16 text-primary absolute" viewBox="0 0 100 100">
              <circle
                className="opacity-20"
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
              />
              <circle
                className="opacity-80"
                cx="50"
                cy="50"
                r="42"
                stroke="url(#ai-fab-gradient)"
                strokeWidth="5"
                strokeDasharray="180"
                strokeDashoffset="50"
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="ai-fab-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
            </svg>
            <button
              onClick={onOpenPanel}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-650 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all z-10"
              title="Sedang Menganalisis Dokumen..."
            >
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenPanel}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-650 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all hover:shadow-indigo-500/45 animate-fadeIn"
            title="Buka Asisten AI"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 sm:bottom-24 right-0 sm:right-6 left-0 sm:left-auto w-full sm:w-[420px] h-[90vh] sm:h-[600px] bg-white rounded-t-3xl sm:rounded-3xl border-t border-x sm:border border-slate-150 shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 animate-slideUp pointer-events-auto"
    >
      {/* Panel Header */}
      <div className="px-6 py-4 flex flex-col gap-3 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between">
          {/* Title and Ping Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white relative shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span className="absolute inset-0 rounded-full border border-blue-400 animate-ping opacity-25"></span>
            </div>
            <h2 className="text-lg font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</h2>
          </div>
          
          {/* Header Actions */}
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-colors border border-transparent hover:border-slate-100" title="Settings">
              <Sliders className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={onClosePanel}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-colors border border-transparent hover:border-slate-100"
              title="Sembunyikan Panel"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-slate-100 text-xs font-bold mt-1">
          <button
            onClick={() => onTabChange('recap')}
            className={`flex-1 pb-2.5 text-center transition-all focus:outline-none ${
              activeTab === 'recap'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            Document Recap
          </button>
          <button
            onClick={() => onTabChange('chat')}
            className={`flex-1 pb-2.5 text-center transition-all focus:outline-none ${
              activeTab === 'chat'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            Ask AI{' '}
            {chatCount > 0 && (
              <span className="ml-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
                {chatCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panel Contents */}
      {activeTab === 'recap' ? (
        <AiRecapTab summary={summary} isLoading={isSummaryLoading} />
      ) : (
        <AiChatTab
          messages={messages}
          isTyping={isTyping}
          onSendQuestion={onSendQuestion}
          fileDetails={fileDetails}
        />
      )}
    </div>
  );
}
