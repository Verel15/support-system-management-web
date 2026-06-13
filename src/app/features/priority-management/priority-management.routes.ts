import { Routes } from '@angular/router';

export const priorityManagementRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./components/priority-list/priority-list.component').then(
        (m) => m.PriorityListComponent,
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/add-priority/add-priority.component').then(
        (m) => m.AddPriorityComponent,
      ),
  },
  {
    path: 'detail',
    loadComponent: () =>
      import('./components/priority-detail/priority-detail.component').then(
        (m) => m.PriorityDetailComponent,
      ),
  },
  {
    path: 'edit',
    loadComponent: () =>
      import('./components/edit-priority/edit-priority.component').then(
        (m) => m.EditPriorityComponent,
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
