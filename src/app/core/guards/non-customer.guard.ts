import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../features/authentication/store/auth.store';

/**
 * บล็อกผู้ใช้ประเภท customer ไม่ให้เข้าหน้าจัดการ (admin).
 * เป็น defense-in-depth ฝั่ง client — backend ต้องบังคับ authz ทุก API ด้วย.
 */
export const nonCustomerGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (store.user()?.accountType === 'CUSTOMER') {
    return router.createUrlTree(['/my-tickets']);
  }
  return true;
};
