import { Routes } from '@angular/router';

export const userTypeManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./user-type-list/user-type-list.component').then(
        (m) => m.UserTypeListComponent,
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-user-type/add-user-type.component').then(
        (m) => m.AddUserTypeComponent,
      ),
  },
  {
    path: 'detail/:typeName',
    loadComponent: () =>
      import('./detail-user-type/detail-user-type.component').then(
        (m) => m.DetailUserTypeComponent,
      ),
  },
  {
    path: 'edit/:typeName',
    loadComponent: () =>
      import('./edit-user-type/edit-user-type.component').then(
        (m) => m.EditUserTypeComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];