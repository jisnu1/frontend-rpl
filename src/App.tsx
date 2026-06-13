import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet, useOutletContext } from 'react-router-dom';
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
import BackgroundActivityContainer from './components/ui/BackgroundActivityContainer';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Tipe context yang diteruskan dari ProtectedLayout ke child routes
type LayoutContext = {
  uploadTrigger: number;
  searchQuery: string;
};

// Hook helper untuk child routes mengambil context dari layout
export function useLayoutContext() {
  return useOutletContext<LayoutContext>();
}

// Loading spinner terpusat
function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

/**
 * ProtectedLayout — Layout shell yang terproteksi.
 *
 * SECURITY FIX: Sidebar dan Header HANYA dirender setelah
 * `isAuthenticated === true` dikonfirmasi. Seluruh rute anak
 * dijamin sudah melewati auth check ini.
 */
function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (isLoading) return <LoadingScreen />;

  // ── Auth Guard ───────────────────────────────────────────────────────────
  // Jika belum login, redirect ke /login — Sidebar & Header TIDAK akan dirender.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // ────────────────────────────────────────────────────────────────────────

  const getSearchPlaceholder = () => {
    if (location.pathname === '/shared') return 'Search shared files...';
    return 'Search Drive...';
  };

  const handleUploadSuccess = () => {
    setUploadTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar — hanya dirender setelah auth terkonfirmasi */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onUploadClick={() => setIsUploadOpen(true)}
        uploadTrigger={uploadTrigger}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Pane */}
      <div className={`flex-1 flex flex-col h-screen w-full overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-[280px]'
      }`}>
        {/* Header — hanya dirender setelah auth terkonfirmasi */}
        <Header
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          searchPlaceholder={getSearchPlaceholder()}
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          showSearch={location.pathname !== '/admin'}
        />

        <main className="flex-1 overflow-y-auto min-h-0">
          {/* Child routes dirender di sini, menerima context dari layout */}
          <Outlet context={{ uploadTrigger, searchQuery } satisfies LayoutContext} />
        </main>
      </div>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Background activity progress toasts */}
      <BackgroundActivityContainer />
    </div>
  );
}

// Admin route guard — hanya untuk user dengan role ADMIN
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated || !user?.roles?.includes('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Page wrappers yang mengambil state dari ProtectedLayout via Outlet context
function DashboardPage() {
  const { uploadTrigger, searchQuery } = useLayoutContext();
  return <Dashboard uploadTrigger={uploadTrigger} searchQuery={searchQuery} />;
}

function RecapPage() {
  const { uploadTrigger, searchQuery } = useLayoutContext();
  return <Recap uploadTrigger={uploadTrigger} searchQuery={searchQuery} />;
}

function SharedPage() {
  const { searchQuery } = useLayoutContext();
  return <Shared searchQuery={searchQuery} />;
}

import ReportButton from './components/ReportButton';

export default function App() {
  return (
    <>
      <Routes>
        {/* ── Public Routes ─────────────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-registration" element={<VerifyRegistration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/shared/public/:provider/:shareToken" element={<PublicSharePage />} />
        <Route path="/shared/public/:shareToken" element={<PublicSharePage />} />

        {/* ── Protected Routes ──────────────────────────────────────────────── */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/recap" element={<RecapPage />} />
          <Route path="/shared" element={<SharedPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Catch-all: Mengarahkan semua rute tak dikenal langsung ke home (/) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      
      {/* Global Antigravity Floating Action Button */}
      <ReportButton />
    </>
  );
}
