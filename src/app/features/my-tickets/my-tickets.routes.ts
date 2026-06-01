import { Routes } from '@angular/router';

export const myTicketsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./my-tickets.component').then((m) => m.MyTicketsComponent),
  },
];
