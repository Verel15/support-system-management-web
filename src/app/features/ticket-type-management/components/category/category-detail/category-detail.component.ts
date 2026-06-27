import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../../shared/components/dialogs';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { TicketCategoryResponse } from '../../../interfaces/ticket-type.interface';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-category-detail',
  imports: [Button, Menu, ConfirmDialogComponent, DeleteConfirmDialogComponent],
  templateUrl: './category-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly ticketCategoryService = inject(TicketCategoryService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);
  protected readonly category = signal<TicketCategoryResponse | null>(null);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข Category', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDialog.set(true) },
  ];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.ticketCategoryService.getById(this.id).subscribe({
      next: (res) => this.category.set(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลได้',
          life: 4000,
        });
        this.router.navigate(['/ticket-type-management/list']);
      },
    });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  protected formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/ticket-type-management/category/edit', this.id]);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.deleting.set(true);
    this.ticketCategoryService.delete(this.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบ Category เรียบร้อยแล้ว',
          life: 4000,
        });
        this.router.navigate(['/ticket-type-management/list']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบข้อมูลได้',
          life: 4000,
        });
        this.deleting.set(false);
      },
    });
  }
}
