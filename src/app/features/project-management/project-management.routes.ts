import { Routes } from '@angular/router';

export const projectManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/project-list/project-list.component').then(
        (m) => m.ProjectListComponent,
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/add-project/add-project.component').then(
        (m) => m.AddProjectComponent,
      ),
  },
  {
    path: 'detail',
    loadComponent: () =>
      import('./components/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
  },
  {
    path: 'edit',
    loadComponent: () =>
      import('./components/edit-project/edit-project.component').then(
        (m) => m.EditProjectComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
