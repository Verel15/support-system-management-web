import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  model,
  computed,
} from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

export type AlertDialogType = 'error' | 'success' | 'warning' | 'info';

@Component({
  selector: 'app-alert-dialog',
  imports: [Button, Dialog],
  templateUrl: './alert-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertDialogComponent {
  visible = model(false);
  type = input<AlertDialogType>('error');
  title = input.required<string>();
  buttonLabel = input('ตกลง');

  closed = output<void>();

  icon = computed(() => {
    const icons: Record<AlertDialogType, string> = {
      error: 'pi pi-times-circle',
      success: 'pi pi-check-circle',
      warning: 'pi pi-exclamation-triangle',
      info: 'pi pi-info-circle',
    };
    return icons[this.type()];
  });

  iconColor = computed(() => {
    const colors: Record<AlertDialogType, string> = {
      error: 'text-error-500',
      success: 'text-primary-500',
      warning: 'text-amber-500',
      info: 'text-blue-500',
    };
    return colors[this.type()];
  });

  close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
