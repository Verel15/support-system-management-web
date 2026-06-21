export interface UserTypeRequest {
  name: string;
  myTicketAccess: string;
  allProjectAccess?: boolean;
  notificationAccess?: boolean;
  dashboardAccess?: boolean;
  allTicketAccess?: boolean;
  manageProjectAccess?: boolean;
  manageUserAccess?: boolean;
  manageCompanyAccess?: boolean;
  manageDataAccess?: boolean;
}

export interface UserTypeResponse {
  id: string;
  name: string;
  myTicketAccess: string;
  allProjectAccess: boolean;
  notificationAccess: boolean;
  dashboardAccess: boolean;
  allTicketAccess: boolean;
  manageProjectAccess: boolean;
  manageUserAccess: boolean;
  manageCompanyAccess: boolean;
  manageDataAccess: boolean;
  createdAt: string;
  updatedAt: string;
}