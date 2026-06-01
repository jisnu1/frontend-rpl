import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadModal from './components/UploadModal';
import Dashboard from './pages/Dashboard/Dashboard';
import Recap from './pages/Recap/Recap';

// Placeholder views for other navigation items
function PlaceholderPage({ title }) {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <span className="material-symbols-outlined text-3xl">construction</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title} Page</h2>
        <p className="text-sm text-slate-500 mt-1">This section is currently under development.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen w-full relative bg-[#F8FAFC]">
        {/* Responsive Drawer Sidebar Navigation */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onUploadClick={() => setIsUploadOpen(true)}
        />

        {/* Main Content Pane */}
        <div className="flex-1 md:pl-[280px] flex flex-col min-h-screen w-full">
          <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
          
          <main className="flex-1 flex flex-col overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/recap" element={<Recap />} />
              <Route path="/shared" element={<PlaceholderPage title="Shared" />} />
              <Route path="/recent" element={<PlaceholderPage title="Recent" />} />
              <Route path="/trash" element={<PlaceholderPage title="Trash" />} />
              <Route path="*" element={<PlaceholderPage title="Not Found" />} />
            </Routes>
          </main>
        </div>

        {/* Global state-driven Interactive Upload Modal */}
        <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      </div>
    </Router>
  );
}
