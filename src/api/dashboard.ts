import apiClient from './apiClient';

export interface MetricDto {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  time: string;
  icon: string;
  bgIcon: string;
  color: string;
}

export interface ActivityDto {
  id: number;
  type: 'alert' | 'ai_analysis' | 'success' | 'routine';
  title: string;
  subtitle?: string;
  user: string;
  time: string;
  status: string;
  statusClass: string;
  icon: string;
  iconClass: string;
  link?: string;
}

export interface DashboardDataDto {
  metrics: MetricDto[];
  recentActivities: ActivityDto[];
}

/**
 * Mengambil data ringkasan Dashboard (metrik bento & log aktivitas)
 */
export async function fetchDashboardData(): Promise<DashboardDataDto> {
  const response = await apiClient.get<DashboardDataDto>('/dashboard/summary');
  return response.data;
}
