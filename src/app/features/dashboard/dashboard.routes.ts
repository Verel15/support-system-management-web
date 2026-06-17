import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
];
