export interface ProjectDetail {
  id: string;
  name: string;
  color: string;
  status: 'Open' | 'Closed';
  company: string;
  adminCount: number;
  customerCount: number;
  lastUpdated: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalUsers: number;
  tickets: {
    open: number;
    inProcess: number;
    done: number;
    close: number;
    return: number;
    reject: number;
  };
}

export interface ProjectMember {
  id: string;
  name: string;
  userType: string;
  position: string;
  email: string;
}

export interface ProjectTicket {
  id: string;
  title: string;
  project: string;
  assignee: string;
  timeRemaining: string;
  team: string;
  status: string;
  priority: 'high' | 'medium' | 'low' | 'none';
}
