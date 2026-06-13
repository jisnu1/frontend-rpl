import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadModal from './components/UploadModal';
import Dashboard from './pages/Dashboard/Dashboard';
import Recap from './pages/Recap/Recap';
import Shared from './pages/Shared/Shared';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyRegistration from './pages/Auth/VerifyRegistration';
import ForgotPassword from './pages/Auth/ForgotPassword';
import PublicSharePage from './pages/Shared/PublicSharePage';
import { useAuth } from './context/AuthContext';
import { Construction } from 'lucide-react';
import BackgroundActivityContainer from './components/ui/BackgroundActivityContainer';

// Reusable Route Protection Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Placeholder page for undeveloped links
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Construction className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title} Page</h2>
        <p className="text-sm text-slate-500 mt-1 font-semibold">This section is currently under development.</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const location = useLocation();

  const getSearchPlaceholder = () => {
    if (location.pathname === '/shared') return 'Search shared files...';
    return 'Search Drive...';
  };

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify-registration' || location.pathname === '/forgot-password';
  const isPublicShareRoute = location.pathname.startsWith('/shared/public/');

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (isPublicShareRoute) {
    return (
      <Routes>
        <Route path="/shared/public/:provider/:shareToken" element={<PublicSharePage />} />
        <Route path="/shared/public/:shareToken" element={<PublicSharePage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-registration" element={<VerifyRegistration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const handleUploadSuccess = () => {
    setUploadTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onUploadClick={() => setIsUploadOpen(true)}
        uploadTrigger={uploadTrigger}
      />

      {/* Main Content Pane */}
      <div className="flex-1 md:pl-[280px] flex flex-col h-screen w-full overflow-hidden">
        <Header
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          searchPlaceholder={getSearchPlaceholder()}
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <main className="flex-1 overflow-y-auto min-h-0">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard uploadTrigger={uploadTrigger} searchQuery={searchQuery} /></ProtectedRoute>} />
            <Route path="/recap" element={<ProtectedRoute><Recap uploadTrigger={uploadTrigger} searchQuery={searchQuery} /></ProtectedRoute>} />
            <Route path="/shared" element={<ProtectedRoute><Shared searchQuery={searchQuery} /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<PlaceholderPage title="Not Found" />} />
          </Routes>
        </main>
      </div>

      {/* Global state-driven Interactive Upload Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadSuccess={handleUploadSuccess} />

      {/* Background activity progress toasts */}
      <BackgroundActivityContainer />
    </div>
  );
}
