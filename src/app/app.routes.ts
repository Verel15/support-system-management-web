import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/authentication/authentication.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'my-tickets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/my-tickets/my-tickets.routes').then((m) => m.myTicketsRoutes),
  },
  {
    path: 'my-project',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/my-project/my-project.routes').then((m) => m.myProjectRoutes),
  },
  {
    path: 'project-management',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/project-management/project-management.routes').then(
        (m) => m.projectManagementRoutes,
      ),
  },
  {
    path: 'ticket-management',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/ticket-management/ticket-managemnet.routes').then(
        (m) => m.ticketManagementRoutes,
      ),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/notifications/notifications.routes').then(
        (m) => m.notificationsRoutes,
      ),
  },
  {
    path: 'user-management',
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/priority-management/priority-management.routes').then(
        (m) => m.priorityManagementRoutes,
      ),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
