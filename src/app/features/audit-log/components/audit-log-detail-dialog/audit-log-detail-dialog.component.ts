import { ChangeDetectionStrategy, Component, effect, inject, input, model, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLogAction, AuditLogDetailResponse, AuditLogFieldChange } from '../../interfaces/audit-log.interface';
import { formatDateTimeShort } from '../../../../shared/utils/date-format.util';

@Component({
  selector: 'app-audit-log-detail-dialog',
  imports: [Dialog, Tag, Button],
  templateUrl: './audit-log-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogDetailDialogComponent {
  private readonly auditLogService = inject(AuditLogService);

  readonly visible = model(false);
  readonly logId = input<string | null>(null);

  protected readonly loading = signal(false);
  protected readonly detail = signal<AuditLogDetailResponse | null>(null);

  constructor() {
    effect(() => {
      const id = this.logId();
      if (this.visible() && id) {
        this.loading.set(true);
        this.detail.set(null);
        this.auditLogService.getById(id).subscribe({
          next: (data) => {
            this.detail.set(data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      }
    });
  }

  protected formatDateTime(iso: string): string {
    return formatDateTimeShort(iso);
  }

  protected formatChangeValue(change: AuditLogFieldChange, value: string | null): string {
    if (value === null) return '-';
    const field = change.field.toLowerCase();
    return field.endsWith('at') || field.endsWith('date')
      ? formatDateTimeShort(value)
      : value;
  }

  protected actionSeverity(action: AuditLogAction): 'success' | 'info' | 'danger' | 'warn' | 'secondary' {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'EXPORT':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  protected onClose(): void {
    this.visible.set(false);
  }
}
