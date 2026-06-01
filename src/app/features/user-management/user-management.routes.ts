import { Routes } from '@angular/router';

export const userManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/user-list/user-list.component').then(
        (m) => m.UserListComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
