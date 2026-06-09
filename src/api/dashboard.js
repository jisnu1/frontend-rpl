import apiClient from './apiClient';

// Data terstruktur lokal sebagai cadangan (fallback) jika backend Spring Boot tidak aktif
const LOCAL_DASHBOARD_DATA = {
  metrics: [
    {
      title: 'Total Storage',
      value: '845.2 TB',
      change: '12%',
      isPositive: true,
      time: 'vs last month',
      icon: 'storage',
      bgIcon: 'database',
      color: 'primary',
    },
    {
      title: 'Active Users',
      value: '12,405',
      change: '4.3%',
      isPositive: true,
      time: 'vs last month',
      icon: 'group',
      bgIcon: 'group',
      color: 'indigo',
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: 'alert',
      title: 'Storage Node B approaching capacity limits',
      user: 'System Auto-Monitor',
      time: '10 mins ago',
      status: 'Critical',
      statusClass: 'bg-error-container text-on-error-container',
      icon: 'warning',
      iconClass: 'bg-error/10 text-error',
    },
    {
      id: 2,
      type: 'ai_analysis',
      title: 'Q3 Global Strategy Report.pdf',
      subtitle: 'AI Recap File Analysis Generated successfully',
      user: 'Jessica (Admin)',
      time: '1 hour ago',
      status: 'AI Analysis',
      statusClass: 'bg-blue-100 text-primary',
      icon: 'auto_awesome',
      iconClass: 'bg-primary/10 text-primary',
      link: '/recap',
    },
    {
      id: 3,
      type: 'success',
      title: 'Bulk Enterprise User Import Completed',
      user: 'Jessica (Admin)',
      time: '3 hours ago',
      status: 'Success',
      statusClass: 'bg-emerald-50 text-emerald-700',
      icon: 'person_add',
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 4,
      type: 'routine',
      title: 'System database daily backup compression',
      user: 'System Auto-Cron',
      time: '5 hours ago',
      status: 'Routine',
      statusClass: 'bg-slate-100 text-slate-600',
      icon: 'settings_backup_restore',
      iconClass: 'bg-[#e0e3e5] text-slate-600',
    },
  ]
};

/**
 * Mengambil data ringkasan Dashboard (metrik bento & log aktivitas)
 */
export async function fetchDashboardData() {
  try {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    console.warn('Gagal memanggil API Dashboard, beralih ke data fallback lokal:', error.message);
    return LOCAL_DASHBOARD_DATA;
  }
}
