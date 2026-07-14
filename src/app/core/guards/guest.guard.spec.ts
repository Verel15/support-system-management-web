import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthStore } from '../../features/authentication/store/auth.store';

describe('guestGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  const redirectTree = new UrlTree();

  function setup(isAuthenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: { isAuthenticated: signal(isAuthenticated) } },
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn().mockReturnValue(redirectTree) },
        },
      ],
    });
    const injector = TestBed.inject(Injector);
    const router = TestBed.inject(Router);
    return {
      result: runInInjectionContext(injector, () => guestGuard(route, state)),
      router,
    };
  }

  it('allows a guest (not authenticated) onto auth pages', () => {
    const { result, router } = setup(false);
    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects an authenticated user away from auth pages', () => {
    const { result, router } = setup(true);
    expect(result).toBe(redirectTree);
    // NOTE: guard currently redirects to /auth/login — likely a bug (should be /my-tickets).
    // This test documents the CURRENT behavior; update it when the guard is fixed.
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
