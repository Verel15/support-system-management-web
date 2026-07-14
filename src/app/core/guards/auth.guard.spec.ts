import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from '../../features/authentication/store/auth.store';

describe('authGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  const loginTree = new UrlTree();

  function setup(isAuthenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: { isAuthenticated: signal(isAuthenticated) } },
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn().mockReturnValue(loginTree) },
        },
      ],
    });
    const injector = TestBed.inject(Injector);
    const router = TestBed.inject(Router);
    return {
      result: runInInjectionContext(injector, () => authGuard(route, state)),
      router,
    };
  }

  it('allows access when authenticated', () => {
    const { result, router } = setup(true);
    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects to /auth/login when not authenticated', () => {
    const { result, router } = setup(false);
    expect(result).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
