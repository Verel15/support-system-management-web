import { Routes } from '@angular/router';

export const notificationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/notification/notifications.component').then(m => m.NotificationsComponent),
  },
];
