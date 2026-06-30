export interface MonthlyData {
  month: number;
  openCount: number;
  successCount: number;
  overdueCount: number;
}

export interface TicketTrendResponse {
  totalOpen: number;
  totalSuccess: number;
  totalOverdue: number;
  monthly: MonthlyData[];
}

export interface TicketSummaryResponse {
  avgOpen: number;
  avgOverdue: number;
  avgSuccess: number;
  openTrend: 'up' | 'down' | 'stable';
  overdueTrend: 'up' | 'down' | 'stable';
  successTrend: 'up' | 'down' | 'stable';
}

export interface StatusCount {
  group: string;
  count: number;
}

export interface TicketStatusDistributionResponse {
  total: number;
  statusCounts: StatusCount[];
}

export interface ProjectStatusDistributionResponse {
  total: number;
  waitingCount: number;
  openCount: number;
  closeCount: number;
}

export interface ProjectTicketCount {
  projectName: string;
  ticketCount: number;
}

export interface TopProjectResponse {
  projects: ProjectTicketCount[];
}
