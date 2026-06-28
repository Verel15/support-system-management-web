import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { catchError, forkJoin, of } from 'rxjs';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
} from '../../../../../shared/components/data-table';
import {
  ConfirmDialogComponent,
  SelectItemsDialogComponent,
  SelectItemOption,
} from '../../../../../shared/components/dialogs';
import { ProjectMember } from '../project-detail.types';
import { ProjectService } from '../../../services/project.service';
import { ProjectMemberResponse } from '../../../interfaces/project.interface';
import { UserService } from '../../../../user-management/services/user.service';
import { UserResponse } from '../../../../user-management/interfaces/user.interface';

const AVATAR_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#10b981', '#eab308',
];

@Component({
  selector: 'app-project-members',
  imports: [
    FormsModule,
    Button,
    Select,
    InputText,
    IconField,
    InputIcon,
    Menu,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
    SelectItemsDialogComponent,
  ],
  templateUrl: './project-members.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMembersComponent {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  readonly readOnly = input(false);
  readonly projectId = input('');

  protected readonly actionMenu = viewChild.required<Menu>('actionMenu');
  protected readonly showRemoveDialog = signal(false);
  protected readonly removing = signal(false);
  protected readonly showAddDialog = signal(false);

  private readonly membersRaw = signal<ProjectMemberResponse[]>([]);
  private readonly allUsers = signal<UserResponse[]>([]);
  private readonly selectedMemberMid = signal<string | null>(null);

  protected readonly memberCandidates = computed<SelectItemOption[]>(() =>
    this.allUsers().map((u, i) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`,
      sublabel: u.accountType === 'CUSTOMER' ? 'ลูกค้า' : 'ผู้พัฒนา',
      avatar: u.profileImageUrl || undefined,
    })),
  );

  protected readonly userTypeFilter = signal<string | null>(null);
  protected readonly positionFilter = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly userTypeOptions = [
    { label: 'ประเภทผู้ใช้ทั้งหมด', value: null },
    { label: 'ลูกค้า', value: 'ลูกค้า' },
    { label: 'ผู้พัฒนา', value: 'ผู้พัฒนา' },
  ];

  protected readonly positionOptions = [
    { label: 'ตำแหน่งทั้งหมด', value: null },
  ];

  private readonly allMembers = computed<ProjectMember[]>(() =>
    this.membersRaw().map((m) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      userType: m.role === 'CUSTOMER' ? 'ลูกค้า' : 'ผู้พัฒนา',
      position: '-',
      email: m.email,
    })),
  );

  protected readonly filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const userType = this.userTypeFilter();
    return this.allMembers().filter(m => {
      const matchesSearch = !query || m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query);
      const matchesType = !userType || m.userType === userType;
      return matchesSearch && matchesType;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredMembers().length);

  protected readonly tableData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredMembers()
      .slice(start, start + this.pageSize())
      .map(m => ({ ...m }) as Record<string, unknown>);
  });

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'รายชื่อ', sortable: true },
    { field: 'userType', header: 'ประเภทผู้ใช้', sortable: true },
    { field: 'position', header: 'ตำแหน่ง', sortable: true },
    { field: 'email', header: 'อีเมล', sortable: true },
  ];

  protected readonly menuItems: MenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.router.navigate(['/user-management/detail']) },
    { label: 'แก้ไข', command: () => this.router.navigate(['/user-management/edit']) },
    { label: 'เปลี่ยนรหัสผ่าน', command: () => {} },
    { separator: true },
    { label: 'ลบ', command: () => this.showRemoveDialog.set(true) },
  ];

  constructor() {
    effect(() => {
      const id = this.projectId();
      if (id) {
        this.loadMembers(id);
        this.loadAllUsers();
      }
    });
  }

  private loadMembers(projectId: string): void {
    this.projectService.getMembers(projectId).subscribe({
      next: (members) => this.membersRaw.set(members),
      error: () => this.membersRaw.set([]),
    });
  }

  private loadAllUsers(): void {
    forkJoin([
      this.userService.getAll({ accountType: 'CUSTOMER' }, 0, 200).pipe(catchError(() => of({ content: [] as UserResponse[] }))),
      this.userService.getAll({ accountType: 'EXTERNAL' }, 0, 200).pipe(catchError(() => of({ content: [] as UserResponse[] }))),
    ]).subscribe(([customers, externals]) => {
      this.allUsers.set([...customers.content, ...externals.content]);
    });
  }

  protected onActionClick(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.selectedMemberMid.set(row['id'] as string);
    this.actionMenu().toggle(event);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected onRemoveConfirmed(): void {
    const mid = this.selectedMemberMid();
    const pid = this.projectId();
    if (!mid || !pid) {
      this.showRemoveDialog.set(false);
      return;
    }
    this.removing.set(true);
    this.projectService.removeMember(pid, mid).subscribe({
      next: () => {
        this.membersRaw.update((ms) => ms.filter((m) => m.id !== mid));
        this.removing.set(false);
        this.showRemoveDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบสมาชิกเรียบร้อยแล้ว',
          life: 3000,
        });
      },
      error: () => {
        this.removing.set(false);
        this.showRemoveDialog.set(false);
      },
    });
  }

  protected onAddConfirmed(selectedUserIds: string[]): void {
    const pid = this.projectId();
    if (!pid || selectedUserIds.length === 0) {
      this.showAddDialog.set(false);
      return;
    }

    const requests = selectedUserIds.map((userId) => {
      const user = this.allUsers().find((u) => u.id === userId);
      const role = user?.accountType === 'CUSTOMER' ? 'CUSTOMER' : 'ASSIGNEE';
      return this.projectService.addMember(pid, { userId, role }).pipe(catchError(() => of(null)));
    });

    forkJoin(requests).subscribe({
      next: (results) => {
        const added = results.filter((r): r is NonNullable<typeof r> => r !== null);
        this.membersRaw.update((ms) => [...ms, ...added]);
        this.showAddDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'บันทึกสำเร็จ',
          detail: 'เพิ่มสมาชิกเรียบร้อยแล้ว',
          life: 3000,
        });
      },
    });
  }
}
