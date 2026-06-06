import { Routes } from '@angular/router';

export const companyManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./company-list/company-list.component').then((m) => m.CompanyListComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-company/add-company.component').then((m) => m.AddCompanyComponent),
  },
  {
    path: 'edit/:companyName',
    loadComponent: () =>
      import('./edit-company/edit-company.component').then((m) => m.EditCompanyComponent),
  },
  {
    path: 'detail/:companyName',
    loadComponent: () =>
      import('./company-detail/company-detail.component').then((m) => m.CompanyDetailComponent),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
