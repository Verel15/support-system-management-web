import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../shared/layouts/auth-layout/auth-layout.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./components/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./components/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'check-email',
        loadComponent: () =>
          import('./components/check-email/check-email.component').then(
            (m) => m.CheckEmailComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./components/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
