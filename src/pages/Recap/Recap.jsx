import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DocumentHeader from './components/DocumentHeader';
import DocumentPreview from './components/DocumentPreview';
import AiAssistantPanel from './components/AiAssistantPanel';
import { fetchAiSummary } from '../../api/recap';

export default function Recap() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('recap'); // recap or chat
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Memicu percakapan AI secara otomatis dari tombol klik (Takeaways, Actions, Entities)
  const triggerAiConversation = (questionText) => {
    setActiveTab('chat');
    
    // Tambah pesan user ke chat thread
    const userMsg = { id: Date.now(), sender: 'user', text: questionText };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Pemanggilan asinkron Axios ke Spring Boot dengan fallback lokal cerdas
    fetchAiSummary(questionText)
      .then((replyText) => {
        setIsTyping(false);
        const aiMsg = { id: Date.now() + 1, sender: 'ai', text: replyText };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .catch((error) => {
        console.error('Error fetching AI reply:', error);
        setIsTyping(false);
      });
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full relative">
      {/* Main Document Preview Canvas Area */}
      <main className="flex-1 relative bg-surface-container-low overflow-hidden flex justify-center pt-8 px-8">
        {/* Back Navigation Link to Dashboard Overview */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-full shadow-sm hover:shadow-md transition-all text-on-surface hover:text-primary border border-surface-variant/50"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="text-sm font-semibold">Back to Overview</span>
          </Link>
        </div>

        {/* The Document Preview Sheet Paper container */}
        <div
          className={`w-full bg-surface-container-lowest shadow-[0px_4px_20px_rgba(15,23,42,0.05)] rounded-t-xl border border-surface-variant/50 flex flex-col relative overflow-hidden transition-all duration-300 ${
            isPanelOpen ? 'max-w-[820px]' : 'max-w-5xl'
          }`}
        >
          <DocumentHeader />
          <DocumentPreview />
        </div>
      </main>

      {/* Modular Interactive AI Assistant Side Panel */}
      <AiAssistantPanel
        isPanelOpen={isPanelOpen}
        onClosePanel={() => setIsPanelOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        messages={messages}
        isTyping={isTyping}
        onSendQuestion={triggerAiConversation}
        onTriggerAiConversation={triggerAiConversation}
      />

      {/* Floating AI Panel Toggle Trigger (When Panel is Closed) */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute right-0 top-24 bg-white rounded-l-xl p-3 shadow-md border border-r-0 border-slate-200 text-primary hover:bg-slate-50 transition-colors z-30 group"
          title="Open AI Assistant"
        >
          <span className="material-symbols-outlined animate-pulse group-hover:animate-none">auto_awesome</span>
        </button>
      )}
    </div>
  );
}
