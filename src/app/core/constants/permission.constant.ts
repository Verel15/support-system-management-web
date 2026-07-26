export const PERMISSIONS = {
  ALL_PROJECT_ACCESS: 'allProjectAccess',
  NOTIFICATION_ACCESS: 'notificationAccess',
  DASHBOARD_ACCESS: 'dashboardAccess',
  ALL_TICKET_ACCESS: 'allTicketAccess',
  MANAGE_PROJECT_ACCESS: 'manageProjectAccess',
  MANAGE_USER_ACCESS: 'manageUserAccess',
  MANAGE_COMPANY_ACCESS: 'manageCompanyAccess',
  MANAGE_DATA_ACCESS: 'manageDataAccess',
  SYSTEM_LOG_ACCESS: 'systemLogAccess',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
