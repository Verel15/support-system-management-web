import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { permissionGuard } from './permission.guard';
import { AuthStore } from '../../features/authentication/store/auth.store';

describe('permissionGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  const redirectTree = new UrlTree();

  function setup(allowed: boolean) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: { hasPermission: () => () => allowed },
        },
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn().mockReturnValue(redirectTree) },
        },
      ],
    });
    const injector = TestBed.inject(Injector);
    const router = TestBed.inject(Router);
    const guard = permissionGuard('manageUserAccess');
    return {
      result: runInInjectionContext(injector, () => guard(route, state)),
      router,
    };
  }

  it('allows when user has the permission', () => {
    const { result, router } = setup(true);
    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('blocks and redirects to /my-tickets when user lacks the permission', () => {
    const { result, router } = setup(false);
    expect(result).toBe(redirectTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/my-tickets']);
  });
});
