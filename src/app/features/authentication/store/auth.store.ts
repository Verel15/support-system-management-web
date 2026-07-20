import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { getCookie, removeCookie, setCookie } from '../../../core/utils/cookie.util';
import { decodeAccessToken } from '../../../core/utils/jwt.util';
import { AuthService, LoginRequest } from '../services/auth.service';

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
  companyId: string | null;
  userTypeId: string | null;
  permissions: string[];
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
  let user = userJson ? (JSON.parse(userJson) as AuthUser) : null;

  // permissions ต้อง decode สดจาก JWT เสมอ ไม่เชื่อค่าที่ค้างใน localStorage
  // เพราะ backend อาจเปลี่ยน permissions ระหว่าง session (แก้ UserType) ได้
  if (user && accessToken) {
    const payload = decodeAccessToken(accessToken);
    user = payload
      ? { ...user, accountType: payload.accountType, userTypeId: payload.userTypeId ?? null, permissions: payload.permissions }
      : null;
  }

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
    hasPermission: computed(() => {
      const u = user();
      return (perm: string): boolean => !!u && (u.accountType === 'ADMIN' || u.permissions.includes(perm));
    }),
    hasRole: computed(() => {
      const u = user();
      return (...roles: string[]): boolean => !!u && roles.includes(u.accountType);
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
            const payload = decodeAccessToken(res.accessToken);
            const user: AuthUser = {
              userId: res.userId,
              email: res.email,
              firstName: res.firstName,
              lastName: res.lastName,
              accountType: res.accountType,
              companyId: res.companyId,
              userTypeId: payload?.userTypeId ?? null,
              permissions: payload?.permissions ?? [],
            };
            persist(res.accessToken, res.refreshToken, user);
            patchState(store, {
              user,
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
              isLoading: false,
              error: null,
            });
            router.navigate(['/my-tickets']);
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
