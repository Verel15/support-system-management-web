import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../shared/components/dialogs';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { ChipComponent } from '../../../../shared/components/chip';
import { HasPermissionDirective } from '../../../../shared/directives';
import { FaqService } from '../../services/faq.service';
import { formatDateFull } from '../../../../shared/utils/date-format.util';

interface FaqData {
  question: string;
  category: string;
  publishLabel: string;
  answer: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-faq-detail',
  imports: [
    Button,
    Menu,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
    StatusChipComponent,
    ChipComponent,
    HasPermissionDirective,
  ],
  templateUrl: './faq-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqDetailComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly faqService = inject(FaqService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);
  protected readonly loading = signal(true);

  protected readonly faq = signal<FaqData>({
    question: '',
    category: '',
    publishLabel: '',
    answer: '',
    viewCount: 0,
    createdAt: '',
    updatedAt: '',
  });

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDialog.set(true) },
  ];

  constructor() {
    this.loadFaq();
  }

  private loadFaq(): void {
    this.faqService.getById(this.id).subscribe({
      next: (res) => {
        this.faq.set({
          question: res.question,
          category: res.category,
          publishLabel: res.published ? 'เผยแพร่แล้ว' : 'แบบร่าง',
          answer: res.answer,
          viewCount: res.viewCount,
          createdAt: formatDateFull(res.createdAt),
          updatedAt: formatDateFull(res.updatedAt),
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลบทความ FAQ ได้',
          life: 4000,
        });
        this.router.navigate(['/faq-management/list']);
      },
    });
  }

  protected onBack(): void {
    this.router.navigate(['/faq-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/faq-management/edit', this.id]);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(password: string): void {
    this.deleting.set(true);
    this.faqService.delete(this.id, password).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบบทความ FAQ เรียบร้อยแล้ว',
          life: 4000,
        });
        this.router.navigate(['/faq-management/list']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบบทความ FAQ ได้',
          life: 4000,
        });
        this.deleting.set(false);
      },
    });
  }
}
