import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Dashboard from '../Dashboard/Dashboard';
import AiAssistantPanel from './components/AiAssistantPanel';
import { fetchAiSummary, fetchPdfSummary, fetchPdfChat } from '../../api/recap';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';

interface Message {
  id: string | number;
  sender: 'user' | 'ai';
  text: string;
}

export default function Recap({ uploadTrigger = 0, searchQuery = '' }: { uploadTrigger?: number; searchQuery?: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get('fileId');
  const { success: toastSuccess, error: toastError } = useToast();

  const [isPanelOpen, setIsPanelOpen] = useState(false); // Starts minimized in the corner
  const [activeTab, setActiveTab] = useState<'recap' | 'chat'>('recap');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const [fileDetails, setFileDetails] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    if (!fileId) {
      // Redirect to main drive page if no fileId is supplied
      navigate('/');
      return;
    }

    const loadFileAndSummary = async () => {
      setIsSummaryLoading(true);
      setMessages([]);
      setIsPanelOpen(false); // keep minimized in the corner as processing indicator
      try {
        // Fetch metadata from backend
        const fileRes = await apiClient.get(`/files/${fileId}`);
        setFileDetails(fileRes.data);

        // Fetch AI PDF summary
        const summaryText = await fetchPdfSummary(fileId);
        setSummary(summaryText);
        
        // Show success toast
        toastSuccess(`AI Recap selesai! Rangkuman dokumen "${fileRes.data.originalFileName}" telah siap.`);
      } catch (err: any) {
        console.error('Failed to load document or AI summary', err);
        setSummary('Gagal memproses berkas PDF ini atau server AI sedang sibuk. Silakan coba kembali nanti.');
        toastError('Gagal memproses rangkuman AI berkas ini.');
      } finally {
        setIsSummaryLoading(false);
      }
    };

    loadFileAndSummary();
  }, [fileId, navigate, toastSuccess, toastError]);

  // Triggers the AI assistant conversation when a prompt/question is clicked
  const triggerAiConversation = (questionText: string) => {
    setActiveTab('chat');
    
    // Add user question to chat thread
    const userMsg: Message = { id: Date.now(), sender: 'user', text: questionText };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Call backend API (use PDF chat endpoint if fileId is present)
    const apiCall = fileId
      ? fetchPdfChat(fileId, questionText)
      : fetchAiSummary(questionText);

    apiCall
      .then((replyText) => {
        setIsTyping(false);
        const aiMsg: Message = { id: Date.now() + 1, sender: 'ai', text: replyText };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .catch((error) => {
        console.error('Error fetching AI reply:', error);
        setIsTyping(false);
        toastError('Gagal memproses jawaban AI.');
      });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 relative h-full">
      {/* Left/Main Area: Dashboard of files for seamless browsing and scrolling */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <Dashboard uploadTrigger={uploadTrigger} searchQuery={searchQuery} />
      </div>

      {/* Floating Interactive AI Assistant Panel */}
      <AiAssistantPanel
        isPanelOpen={isPanelOpen}
        onClosePanel={() => setIsPanelOpen(false)}
        onOpenPanel={() => setIsPanelOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        messages={messages}
        isTyping={isTyping}
        onSendQuestion={triggerAiConversation}
        onTriggerAiConversation={triggerAiConversation}
        fileDetails={fileDetails}
        summary={summary}
        isSummaryLoading={isSummaryLoading}
      />
    </div>
  );
}
