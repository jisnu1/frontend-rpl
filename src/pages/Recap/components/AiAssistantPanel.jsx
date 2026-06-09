import React from 'react';
import AiRecapTab from './AiRecapTab';
import AiChatTab from './AiChatTab';

export default function AiAssistantPanel({
  isPanelOpen,
  onClosePanel,
  activeTab,
  onTabChange,
  messages,
  isTyping,
  onSendQuestion,
  onTriggerAiConversation,
}) {
  // Menghitung jumlah interaksi tanya jawab user
  const chatCount = messages.filter((msg) => msg.sender === 'user').length;

  return (
    <aside
      className={`w-[420px] bg-white border-l border-slate-150 h-full flex flex-col shadow-[-10px_0px_30px_rgba(15,23,42,0.03)] z-20 transition-all duration-300 ${
        isPanelOpen
          ? 'translate-x-0'
          : 'translate-x-full absolute right-0 top-0 bottom-0 pointer-events-none opacity-0'
      }`}
    >
      {/* Panel Header */}
      <div className="px-6 py-4 flex flex-col gap-3 border-b border-surface-variant/40 bg-surface-container-lowest/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          {/* Title and Ping Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
              <span className="material-symbols-outlined text-[18px] icon-fill">auto_awesome</span>
              <span className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20"></span>
            </div>
            <h2 className="text-lg font-extrabold ai-gradient-text">AI Assistant</h2>
          </div>
          
          {/* Header Actions */}
          <div className="flex gap-1">
            <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors" title="Settings">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
            <button
              onClick={onClosePanel}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
              title="Close Panel"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-slate-100 text-xs font-bold">
          <button
            onClick={() => onTabChange('recap')}
            className={`flex-1 pb-2 text-center transition-all focus:outline-none ${
              activeTab === 'recap'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Document Recap
          </button>
          <button
            onClick={() => onTabChange('chat')}
            className={`flex-1 pb-2 text-center transition-all focus:outline-none ${
              activeTab === 'chat'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-400 hover:text-slate-600'
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
        <AiRecapTab onTriggerAiConversation={onTriggerAiConversation} />
      ) : (
        <AiChatTab
          messages={messages}
          isTyping={isTyping}
          onSendQuestion={onSendQuestion}
        />
      )}
    </aside>
  );
}
