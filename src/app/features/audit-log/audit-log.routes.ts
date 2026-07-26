import { Routes } from '@angular/router';

export const auditLogRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/audit-log-list/audit-log-list.component').then(
        (m) => m.AuditLogListComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
