import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { of } from 'rxjs';
import {
  CanDeactivateComponent,
  unsavedChangesGuard,
} from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  function run(component: CanDeactivateComponent) {
    const injector = TestBed.inject(Injector);
    return runInInjectionContext(injector, () =>
      unsavedChangesGuard(component, route, state, state),
    );
  }

  beforeEach(() => TestBed.configureTestingModule({}));

  it('delegates to the component canDeactivate (boolean true)', () => {
    expect(run({ canDeactivate: () => true })).toBe(true);
  });

  it('delegates to the component canDeactivate (boolean false)', () => {
    expect(run({ canDeactivate: () => false })).toBe(false);
  });

  it('passes through an observable result', () => {
    const obs = of(true);
    expect(run({ canDeactivate: () => obs })).toBe(obs);
  });
});
