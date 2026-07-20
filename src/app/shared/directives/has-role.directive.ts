import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthStore } from '../../features/authentication/store/auth.store';

/**
 * ซ่อน/โชว์ element ตาม accountType ของ user ปัจจุบัน.
 * เป็นแค่ UX — enforcement จริงอยู่ backend @PreAuthorize.
 *
 * @example
 * <li *appHasRole="['STAFF', 'ADMIN']">จัดการแผนก</li>
 */
@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authStore = inject(AuthStore);

  appHasRole = input.required<string[]>();

  private hasViewCreated = false;

  constructor() {
    effect(() => {
      const allowed = this.authStore.hasRole()(...this.appHasRole());

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
