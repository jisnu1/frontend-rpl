import React, { useState, useEffect } from 'react';
import MetricCard from './components/MetricCard';
import SystemHealthCard from './components/SystemHealthCard';
import StorageDistributionChart from './components/StorageDistributionChart';
import UserActivityChart from './components/UserActivityChart';
import RecentActivityList from './components/RecentActivityList';
import { fetchDashboardData } from '../../api/dashboard';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    metrics: [],
    recentActivities: []
  });

  useEffect(() => {
    async function loadData() {
      const data = await fetchDashboardData();
      if (data) {
        setDashboardData(data);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            Admin Overview
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time status updates and activity logs for storage services.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardData.metrics && dashboardData.metrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
        <SystemHealthCard />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StorageDistributionChart />
        <UserActivityChart />
      </div>

      {/* Recent System Activity List */}
      <RecentActivityList activities={dashboardData.recentActivities} />
    </div>
  );
}
