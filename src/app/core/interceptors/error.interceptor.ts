import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 is handled by authInterceptor (redirect to login)
      if (error.status !== 401) {
        const detail = error.error?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        messageService.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail, life: 4000 });
      }
      return throwError(() => error);
    }),
  );
};
