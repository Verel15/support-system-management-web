import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Password } from 'primeng/password';

@Component({
  selector: 'app-delete-confirm-dialog',
  imports: [Button, Dialog, Password, FormsModule],
  templateUrl: './delete-confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmDialogComponent {
  visible = model(false);
  targetLabel = input.required<string>();
  loading = input(false);

  confirmed = output<string>();
  cancelled = output<void>();

  protected readonly password = signal('');
  protected readonly canConfirm = computed(() => this.password().trim().length > 0);

  protected onCancel(): void {
    this.password.set('');
    this.visible.set(false);
    this.cancelled.emit();
  }

  protected onConfirm(): void {
    if (!this.canConfirm()) return;
    this.confirmed.emit(this.password());
    this.password.set('');
    this.visible.set(false);
  }
}
