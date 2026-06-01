import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: 'my-tickets',
        loadChildren: () =>
          import('../my-tickets/my-tickets.routes').then((m) => m.myTicketsRoutes),
      },
      { path: '', pathMatch: 'full', redirectTo: 'my-tickets' },
    ],
  },
];
