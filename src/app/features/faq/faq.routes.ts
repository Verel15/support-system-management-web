import { Routes } from '@angular/router';

export const faqRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/faq-list/faq-list.component').then((m) => m.FaqListComponent),
  },
];
