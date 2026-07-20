import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { nonCustomerGuard } from './non-customer.guard';
import { AuthStore } from '../../features/authentication/store/auth.store';

describe('nonCustomerGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  const redirectTree = new UrlTree();

  function setup(accountType: string | null) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: { user: signal(accountType ? { accountType } : null) },
        },
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn().mockReturnValue(redirectTree) },
        },
      ],
    });
    const injector = TestBed.inject(Injector);
    const router = TestBed.inject(Router);
    return {
      result: runInInjectionContext(injector, () => nonCustomerGuard(route, state)),
      router,
    };
  }

  it('blocks CUSTOMER and redirects to /my-tickets', () => {
    const { result, router } = setup('CUSTOMER');
    expect(result).toBe(redirectTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/my-tickets']);
  });

  it('allows STAFF users', () => {
    const { result, router } = setup('STAFF');
    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('allows when there is no user (accountType undefined)', () => {
    const { result } = setup(null);
    expect(result).toBe(true);
  });
});
