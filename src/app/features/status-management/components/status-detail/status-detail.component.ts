import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../shared/components/dialogs';
import { StatusFlowService } from '../../services/status-flow.service';
import { StatusFlowResponse, StatusItemResponse } from '../../interfaces/status-flow.interface';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-status-detail',
  imports: [Button, Menu, Tooltip, ConfirmDialogComponent, DeleteConfirmDialogComponent],
  templateUrl: './status-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusDetailComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly statusFlowService = inject(StatusFlowService);
  protected readonly menu = viewChild<Menu>('actionMenu');

  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);
  protected readonly loading = signal(true);
  protected readonly status = signal<StatusFlowResponse | null>(null);

  protected readonly startStatuses = computed(() =>
    this.status()?.statuses.filter((s) => s.group === 'START') ?? [],
  );
  protected readonly processStatuses = computed(() =>
    this.status()?.statuses.filter((s) => s.group === 'PROCESS').sort((a, b) => a.sequence - b.sequence) ?? [],
  );
  protected readonly successStatuses = computed(() =>
    this.status()?.statuses.filter((s) => s.group === 'SUCCESS') ?? [],
  );
  protected readonly failedStatuses = computed(() =>
    this.status()?.statuses.filter((s) => s.group === 'FAILED') ?? [],
  );

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDialog.set(true) },
  ];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/status-management/list']);
      return;
    }
    this.statusFlowService.getById(id).subscribe({
      next: (data) => {
        this.status.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลสถานะได้',
          life: 4000,
        });
        this.router.navigate(['/status-management/list']);
      },
    });
  }

  protected groupColor(status: StatusItemResponse): string {
    switch (status.group) {
      case 'START': return 'bg-blue-500';
      case 'PROCESS': return 'bg-orange-400';
      case 'SUCCESS': return 'bg-green-500';
      case 'FAILED': return 'bg-red-500';
    }
  }

  protected groupTextColor(status: StatusItemResponse): string {
    switch (status.group) {
      case 'START': return 'text-blue-600';
      case 'PROCESS': return 'text-orange-500';
      case 'SUCCESS': return 'text-green-600';
      case 'FAILED': return 'text-red-500';
    }
  }

  protected onBack(): void {
    this.router.navigate(['/status-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu()?.toggle(event);
  }

  protected onEdit(): void {
    const id = this.status()?.id;
    if (id) this.router.navigate(['/status-management/edit', id]);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    const id = this.status()?.id;
    if (!id) return;
    this.deleting.set(true);
    this.statusFlowService.delete(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบสถานะเรียบร้อยแล้ว',
          life: 4000,
        });
        this.router.navigate(['/status-management/list']);
      },
      error: () => {
        this.deleting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบสถานะได้',
          life: 4000,
        });
      },
    });
  }
}
