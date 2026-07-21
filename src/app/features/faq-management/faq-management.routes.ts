import { Routes } from '@angular/router';

export const faqManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/faq-list/faq-list.component').then((m) => m.FaqListComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/add-faq/add-faq.component').then((m) => m.AddFaqComponent),
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./components/faq-detail/faq-detail.component').then((m) => m.FaqDetailComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/edit-faq/edit-faq.component').then((m) => m.EditFaqComponent),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
