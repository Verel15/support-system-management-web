import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthStore } from '../../features/authentication/store/auth.store';

/**
 * ซ่อน/โชว์ element ตาม permission flag ของ user ปัจจุบัน.
 * เป็นแค่ UX — enforcement จริงอยู่ backend @PreAuthorize.
 *
 * @example
 * <button *appHasPermission="'manageUserAccess'">สร้างผู้ใช้</button>
 */
@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authStore = inject(AuthStore);

  appHasPermission = input.required<string>();

  private hasViewCreated = false;

  constructor() {
    effect(() => {
      const allowed = this.authStore.hasPermission()(this.appHasPermission());

      if (allowed && !this.hasViewCreated) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasViewCreated = true;
      } else if (!allowed && this.hasViewCreated) {
        this.viewContainer.clear();
        this.hasViewCreated = false;
      }
    });
  }
}
