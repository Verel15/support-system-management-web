import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let injector: Injector;
  const add = vi.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MessageService, useValue: { add } }],
    });
    injector = TestBed.inject(Injector);
    add.mockClear();
  });

  function run(next: HttpHandlerFn) {
    const req = new HttpRequest('GET', '/api/x');
    return runInInjectionContext(injector, () => errorInterceptor(req, next));
  }

  it('does not show a toast on 401 (handled by authInterceptor)', () => {
    const next: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 401 }));
    run(next).subscribe({ error: () => {} });
    expect(add).not.toHaveBeenCalled();
  });

  it('shows an error toast with the server message on non-401 errors', () => {
    const next: HttpHandlerFn = () =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'ข้อมูลไม่ถูกต้อง' },
          }),
      );
    run(next).subscribe({ error: () => {} });
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'ข้อมูลไม่ถูกต้อง' }),
    );
  });

  it('falls back to a default message when the server sends none', () => {
    const next: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({ status: 500 }));
    run(next).subscribe({ error: () => {} });
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        detail: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      }),
    );
  });

  it('re-throws the error to downstream subscribers', () => {
    const err = new HttpErrorResponse({ status: 500 });
    const next: HttpHandlerFn = () => throwError(() => err);
    let caught: unknown;
    run(next).subscribe({ error: (e) => (caught = e) });
    expect(caught).toBe(err);
  });
});
