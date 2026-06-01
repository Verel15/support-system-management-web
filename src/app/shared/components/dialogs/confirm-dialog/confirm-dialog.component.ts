import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

export type ConfirmDialogType = 'warning' | 'info' | 'error';

@Component({
  selector: 'app-confirm-dialog',
  imports: [Button, Dialog],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  visible = model(false);
  type = input<ConfirmDialogType>('warning');
  title = input.required<string>();
  confirmLabel = input('ยืนยัน');
  cancelLabel = input('ยกเลิก');
  loading = input(false);

  confirmed = output<void>();
  cancelled = output<void>();

  protected readonly icon = computed(() => {
    const icons: Record<ConfirmDialogType, string> = {
      warning: 'pi pi-exclamation-circle',
      info: 'pi pi-info-circle',
      error: 'pi pi-times-circle',
    };
    return icons[this.type()];
  });

  protected readonly iconColor = computed(() => {
    const colors: Record<ConfirmDialogType, string> = {
      warning: 'text-warning-500',
      info: 'text-blue-500',
      error: 'text-error-500',
    };
    return colors[this.type()];
  });

  protected onCancel(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }

  protected onConfirm(): void {
    this.confirmed.emit();
  }
}
