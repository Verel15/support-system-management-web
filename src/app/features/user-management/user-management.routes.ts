import { Routes } from '@angular/router';

export const userManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/add-user/add-user.component').then((m) => m.AddUserComponent),
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/edit-user/edit-user.component').then((m) => m.EditUserComponent),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
