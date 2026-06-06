import { Routes } from '@angular/router';

export const statusManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/status-list/status-list.component').then(
        (m) => m.StatusListComponent,
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/add-status/add-status.component').then(
        (m) => m.AddStatusComponent,
      ),
  },
  {
    path: 'detail',
    loadComponent: () =>
      import('./components/status-detail/status-detail.component').then(
        (m) => m.StatusDetailComponent,
      ),
  },
  {
    path: 'edit',
    loadComponent: () =>
      import('./components/edit-status/edit-status.component').then(
        (m) => m.EditStatusComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
