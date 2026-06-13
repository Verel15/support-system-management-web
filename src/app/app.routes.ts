import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'user-management',
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/user-management/user-management.routes').then(
        (m) => m.userManagementRoutes,
      ),
  },
  {
    path: 'user-type-management',
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/user-type-management/user-type-management.routes').then(
        (m) => m.userTypeManagementRoutes,
      ),
  },
  {
    path: 'company-management',
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/company-management/company-management.routes').then(
        (m) => m.companyManagementRoutes,
      ),
  },
  {
    path: 'status-management',
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/status-management/status-management.routes').then(
        (m) => m.statusManagementRoutes,
      ),
  },
  {
    path: 'ticket-type-management',
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/ticket-type-management/ticket-type-management.routes').then(
        (m) => m.ticketTypeManagementRoutes,
      ),
  },
  {
    path: 'ticket-priority-management',
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/priority-management/priority-management.routes').then(
        (m) => m.priorityManagementRoutes,
      ),
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
];
