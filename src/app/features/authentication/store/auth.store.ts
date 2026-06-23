import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { getCookie, removeCookie, setCookie } from '../../../core/utils/cookie.util';
import { AuthService, LoginRequest } from '../services/auth.service';

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const COOKIE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
} as const;

const USER_STORAGE_KEY = 'auth_user';

function hydrateState(): AuthState {
  const accessToken = getCookie(COOKIE_KEYS.accessToken);
  const refreshToken = getCookie(COOKIE_KEYS.refreshToken);
  const userJson = localStorage.getItem(USER_STORAGE_KEY);
  const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;
  return { user, accessToken, refreshToken, isLoading: false, error: null };
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(hydrateState()),
  withComputed(({ user, accessToken }) => ({
    isAuthenticated: computed(() => !!accessToken() && !!user()),
    fullName: computed(() => {
      const u = user();
      return u ? `${u.firstName} ${u.lastName}` : '';
    }),
  })),
  withMethods((store) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    function persist(accessToken: string, refreshToken: string, user: AuthUser): void {
      setCookie(COOKIE_KEYS.accessToken, accessToken);
      setCookie(COOKIE_KEYS.refreshToken, refreshToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }

    function clearAll(): void {
      removeCookie(COOKIE_KEYS.accessToken);
      removeCookie(COOKIE_KEYS.refreshToken);
      localStorage.removeItem(USER_STORAGE_KEY);
    }

    return {
      login(req: LoginRequest): void {
        patchState(store, { isLoading: true, error: null });
        authService.login(req).subscribe({
          next: (res) => {
            const user: AuthUser = {
              userId: res.userId,
              email: res.email,
              firstName: res.firstName,
              lastName: res.lastName,
              accountType: res.accountType,
            };
            persist(res.accessToken, res.refreshToken, user);
            patchState(store, {
              user,
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
              isLoading: false,
              error: null,
            });
            router.navigate(['/dashboard']);
          },
          error: (err: unknown) => {
            const msg = (err as { error?: { message?: string } })?.error?.message ?? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
            patchState(store, { isLoading: false, error: msg });
          },
        });
      },

      logout(): void {
        authService.logout().subscribe();
        clearAll();
        patchState(store, { user: null, accessToken: null, refreshToken: null, isLoading: false, error: null });
        router.navigate(['/auth/login']);
      },

      clearSession(): void {
        clearAll();
        patchState(store, { user: null, accessToken: null, refreshToken: null, isLoading: false, error: null });
        router.navigate(['/auth/login']);
      },
    };
  }),
);
