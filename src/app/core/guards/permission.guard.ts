import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../features/authentication/store/auth.store';

/**
 * บล็อกผู้ใช้ที่ไม่มี permission flag ที่กำหนดไม่ให้เข้าหน้านั้น.
 * เป็น defense-in-depth ฝั่ง client — backend @PreAuthorize บังคับสิทธิ์จริงอยู่แล้ว.
 */
export function permissionGuard(permission: string): CanActivateFn {
  return () => {
    const store = inject(AuthStore);
    const router = inject(Router);

    if (store.hasPermission()(permission)) {
      return true;
    }
    return router.createUrlTree(['/my-tickets']);
  };
}
