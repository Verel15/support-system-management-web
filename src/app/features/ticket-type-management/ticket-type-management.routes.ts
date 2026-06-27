import { Routes } from '@angular/router';

export const ticketTypeManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/ticket-type-list/ticket-type-list.component').then(
        (m) => m.TicketTypeListComponent,
      ),
  },
  {
    path: 'ticket-type/add',
    loadComponent: () =>
      import('./components/ticket-type/add-ticket-type/add-ticket-type.component').then(
        (m) => m.AddTicketTypeComponent,
      ),
  },
  {
    path: 'ticket-type/detail/:id',
    loadComponent: () =>
      import('./components/ticket-type/ticket-type-detail/ticket-type-detail.component').then(
        (m) => m.TicketTypeDetailComponent,
      ),
  },
  {
    path: 'ticket-type/edit/:id',
    loadComponent: () =>
      import('./components/ticket-type/edit-ticket-type/edit-ticket-type.component').then(
        (m) => m.EditTicketTypeComponent,
      ),
  },
  {
    path: 'category/add',
    loadComponent: () =>
      import('./components/category/add-category/add-category.component').then(
        (m) => m.AddCategoryComponent,
      ),
  },
  {
    path: 'category/detail/:id',
    loadComponent: () =>
      import('./components/category/category-detail/category-detail.component').then(
        (m) => m.CategoryDetailComponent,
      ),
  },
  {
    path: 'category/edit/:id',
    loadComponent: () =>
      import('./components/category/edit-category/edit-category.component').then(
        (m) => m.EditCategoryComponent,
      ),
  },
  {
    path: 'sub-category/add',
    loadComponent: () =>
      import('./components/sub-category/add-sub-category/add-sub-category.component').then(
        (m) => m.AddSubCategoryComponent,
      ),
  },
  {
    path: 'sub-category/detail/:id',
    loadComponent: () =>
      import('./components/sub-category/sub-category-detail/sub-category-detail.component').then(
        (m) => m.SubCategoryDetailComponent,
      ),
  },
  {
    path: 'sub-category/edit/:id',
    loadComponent: () =>
      import('./components/sub-category/edit-sub-category/edit-sub-category.component').then(
        (m) => m.EditSubCategoryComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
