import { Routes } from '@angular/router';

export const userTypeManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./user-type-list/user-type-list.component').then(
        (m) => m.UserTypeListComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];