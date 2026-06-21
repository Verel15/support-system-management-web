import { Routes } from '@angular/router';

export const userTypeManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/user-type-list/user-type-list.component').then(
        (m) => m.UserTypeListComponent,
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/add-user-type/add-user-type.component').then(
        (m) => m.AddUserTypeComponent,
      ),
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./components/detail-user-type/detail-user-type.component').then(
        (m) => m.DetailUserTypeComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/edit-user-type/edit-user-type.component').then(
        (m) => m.EditUserTypeComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
