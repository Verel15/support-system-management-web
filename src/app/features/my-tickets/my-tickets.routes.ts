import { Routes } from '@angular/router';

export const myTicketsRoutes: Routes = [
  {
    path: '/my-ticket',
    loadComponent: () =>
      import('./my-tickets.component').then((m) => m.MyTicketsComponent),
  },
];
