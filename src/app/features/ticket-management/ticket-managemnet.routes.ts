import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const ticketManagementRoutes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () =>
      import('./components/ticket-list/ticket-list.component').then(
        (m) => m.TicketListComponent,
      ),
  },
  {
    path: 'add',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./components/add-ticket/add-ticket.component').then(
        (m) => m.AddTicketComponent,
      ),
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./components/ticket-detail/ticket-detail.component').then(
        (m) => m.TicketDetailComponent,
      ),
  },
]