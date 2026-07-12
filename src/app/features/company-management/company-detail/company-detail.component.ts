import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table';
import { ProjectCardComponent, Project } from '../../../shared/components/project-card';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../shared/components/dialogs';
import { Divider } from 'primeng/divider';
import { CompanyService } from '../services/company.service';
import { CompanyResponse } from '../interfaces/company.interface';
import { ProjectResponse } from '../../project-management/interfaces/project.interface';
import { formatDateShort } from '../../../shared/utils/date-format.util';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

const MEMBER_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#f97316', '#06b6d4'];

@Component({
  selector: 'app-company-detail',
  imports: [
    FormsModule,
    Button,
    Menu,
    IconField,
    InputIcon,
    InputText,
    DataTableComponent,
    ProjectCardComponent,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
    Divider,
  ],
  templateUrl: './company-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly companyService = inject(CompanyService);

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDeleteDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  private readonly companyId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly company = signal<CompanyResponse | null>(null);
  protected readonly companyName = computed(() => this.company()?.name ?? '');
  protected readonly createdAtFormatted = computed(() => {
    const createdAt = this.company()?.createdAt;
    return createdAt ? formatDateShort(createdAt) : '';
  });

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDeleteDialog.set(true) },
  ];

  protected readonly memberColumns: TableColumn[] = [
    { field: 'name', header: 'รายชื่อ' },
    { field: 'email', header: 'อีเมล' },
    { field: 'phone', header: 'เบอร์โทรศัพท์' },
  ];

  protected readonly memberSearchQuery = signal('');
  protected readonly memberPage = signal(1);
  protected readonly memberPageSize = signal(10);
  protected readonly memberLoading = signal(false);
  protected readonly totalMemberRecords = signal(0);
  protected readonly pagedMembers = signal<Record<string, unknown>[]>([]);

  protected readonly projects = signal<Project[]>([]);
  protected readonly projectsLoading = signal(false);

  private readonly memberSearch$ = new Subject<string>();

  constructor() {
    if (!this.companyId) {
      this.router.navigate(['/company-management/list']);
      return;
    }

    this.memberSearch$.pipe(debounceTime(300)).subscribe((query) => {
      this.memberSearchQuery.set(query);
      this.memberPage.set(1);
      this.loadMembers();
    });

    this.loadCompany();
    this.loadMembers();
    this.loadProjects();
  }

  private loadCompany(): void {
    this.companyService.getById(this.companyId).subscribe({
      next: (data) => this.company.set(data),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลบริษัทได้',
          life: 4000,
        });
        this.router.navigate(['/company-management/list']);
      },
    });
  }

  private loadMembers(): void {
    this.memberLoading.set(true);
    this.companyService
      .getUsers(
        this.companyId,
        { keyword: this.memberSearchQuery() || undefined },
        this.memberPage() - 1,
        this.memberPageSize(),
      )
      .subscribe({
        next: (res) => {
          this.pagedMembers.set(
            res.content.map((u) => ({
              name: `${u.firstName} ${u.lastName}`.trim(),
              email: u.email,
              phone: u.phone,
            })),
          );
          this.totalMemberRecords.set(res.totalElements);
          this.memberLoading.set(false);
        },
        error: () => {
          this.memberLoading.set(false);
        },
      });
  }

  private loadProjects(): void {
    this.projectsLoading.set(true);
    this.companyService.getProjects(this.companyId).subscribe({
      next: (res) => {
        this.projects.set(res.map((p) => this.mapToProject(p)));
        this.projectsLoading.set(false);
      },
      error: () => {
        this.projectsLoading.set(false);
      },
    });
  }

  private mapToProject(r: ProjectResponse): Project {
    return {
      id: r.id,
      name: r.name,
      status: r.status,
      date: formatDateShort(r.endDate),
      owner: r.companyName ?? '',
      totalTickets: r.totalTickets,
      successTicketCount: r.successTicketCount,
      members: (r.members ?? []).map((m, i) => ({
        initials: m.fullName.charAt(0),
        color: MEMBER_COLORS[i % MEMBER_COLORS.length],
        avatarUrl: m.profileImageUrl || undefined,
        fullName: m.fullName,
      })),
      highCount: 0,
      normalCount: 0,
      accentColor: r.color ?? '#3b82f6',
      attachmentCount: r.documentCount ?? 0,
    };
  }

  protected onBack(): void {
    this.router.navigate(['/company-management/list']);
  }

  protected onEdit(): void {
    this.router.navigate(['/company-management/edit', this.companyId]);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onMemberSearch(value: string): void {
    this.memberSearch$.next(value);
  }

  protected onMemberPageChange(page: number): void {
    this.memberPage.set(page);
    this.loadMembers();
  }

  protected onMemberPageSizeChange(size: number): void {
    this.memberPageSize.set(size);
    this.memberPage.set(1);
    this.loadMembers();
  }

  protected onConfirmDelete(): void {
    this.showConfirmDeleteDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(password: string): void {
    this.deleting.set(true);
    this.companyService.delete(this.companyId, password).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบบริษัทสำเร็จ',
          detail: 'ลบข้อมูลบริษัทเรียบร้อยแล้ว',
          life: 4000,
        });
        this.deleting.set(false);
        this.router.navigate(['/company-management/list']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบบริษัทได้',
          life: 4000,
        });
        this.deleting.set(false);
      },
    });
  }
}
