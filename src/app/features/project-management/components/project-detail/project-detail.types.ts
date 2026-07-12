import { ProjectStatus } from '../../interfaces/project.interface';

export interface ProjectDetail {
  id: string;
  name: string;
  color: string;
  status: ProjectStatus;
  company: string;
  adminCount: number;
  customerCount: number;
  lastUpdated: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalUsers: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  userType: string;
  position: string;
  email: string;
}
