import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from '../../features/authentication/store/auth.store';
import { removeCookie, setCookie } from '../utils/cookie.util';

describe('authInterceptor', () => {
  let injector: Injector;
  const clearSession = vi.fn();

  beforeEach(() => {
    removeCookie('access_token');
    TestBed.configureTestingModule({
      providers: [{ provide: AuthStore, useValue: { clearSession } }],
    });
    injector = TestBed.inject(Injector);
    clearSession.mockClear();
  });

  afterEach(() => removeCookie('access_token'));

  function run(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    return runInInjectionContext(injector, () => authInterceptor(req, next));
  }

  it('adds an Authorization header when a token exists', () => {
    setCookie('access_token', 'tok-123');
    const req = new HttpRequest('GET', '/api/x');
    const next = vi.fn<HttpHandlerFn>((r) => {
      expect(r.headers.get('Authorization')).toBe('Bearer tok-123');
      return of(new HttpResponse());
    });

    run(req, next).subscribe();
    expect(next).toHaveBeenCalledOnce();
  });

  it('leaves the request unchanged when no token exists', () => {
    const req = new HttpRequest('GET', '/api/x');
    const next = vi.fn<HttpHandlerFn>((r) => {
      expect(r.headers.has('Authorization')).toBe(false);
      return of(new HttpResponse());
    });

    run(req, next).subscribe();
    expect(next).toHaveBeenCalledOnce();
  });

  it('clears the session on a 401 response', () => {
    setCookie('access_token', 'tok');
    const req = new HttpRequest('GET', '/api/x');
    const next: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 401 }));

    run(req, next).subscribe({ error: () => {} });
    expect(clearSession).toHaveBeenCalledOnce();
  });

  it('does not clear the session on a non-401 error', () => {
    setCookie('access_token', 'tok');
    const req = new HttpRequest('GET', '/api/x');
    const next: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 500 }));

    run(req, next).subscribe({ error: () => {} });
    expect(clearSession).not.toHaveBeenCalled();
  });
});
