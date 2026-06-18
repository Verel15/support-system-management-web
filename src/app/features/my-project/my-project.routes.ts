import { Routes } from '@angular/router';

export const myProjectRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/my-project-list/my-project-list.component').then(
        (m) => m.MyProjectListComponent,
      ),
  },
  {
    path: 'detail',
    loadComponent: () =>
      import('./components/my-project-detail/my-project-detail.component').then(
        (m) => m.MyProjectDetailComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
