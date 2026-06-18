import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const myTicketsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/my-ticket/my-tickets.component').then((m) => m.MyTicketsComponent),
  },
  {
    path: 'add',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./components/my-ticket/add-ticket/add-ticket.component').then((m) => m.AddTicketComponent),
  },
];
