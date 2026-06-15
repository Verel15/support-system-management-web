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

interface Member {
  name: string;
  email: string;
  phone: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

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
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDeleteDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);

  protected readonly companyName = this.route.snapshot.paramMap.get('companyName') ?? '';

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDeleteDialog.set(true) },
  ];

  protected readonly companyStats = {
    memberCount: 38,
    projectCount: 8,
    createdAt: '03/08/2566',
  };

  protected readonly memberColumns: TableColumn[] = [
    { field: 'name', header: 'รายชื่อ', sortable: true },
    { field: 'email', header: 'อีเมล', sortable: true },
    { field: 'phone', header: 'เบอร์โทรศัพท์', sortable: true },
  ];

  private readonly allMembers: Member[] = [
    { name: 'ใจงาม สุดใจจริง', email: 'Jaiknam@gmail.com', phone: '000-0000-000' },
    { name: 'แสนดี ที่สุดเลย', email: 'Sansee@gmail.com', phone: '000-0000-000' },
    { name: 'มานี มีตา', email: 'Manee@gmail.com', phone: '000-0000-000' },
    { name: 'ตุ๊กตุ๊ก ตุ๊กแก', email: 'Tuktuk@gmail.com', phone: '000-0000-000' },
    { name: 'สิริ สวัสดี', email: 'Siri@gmail.com', phone: '000-0000-000' },
    { name: 'มีตัง ต้นเดือน', email: 'Metung@gmail.com', phone: '000-0000-000' },
    { name: 'ซู่ใจ ใจดี', email: 'Shujai@gmail.com', phone: '000-0000-000' },
    { name: 'ปิติ ยินดี', email: 'Piti@gmail.com', phone: '000-0000-000' },
    { name: 'แก้ว กินน้ำ', email: 'Kwaw@gmail.com', phone: '000-0000-000' },
    { name: 'มะลิสา ขึ้นต้นเป็นมะลิซ้อน', email: 'Malila@gmail.com', phone: '000-0000-000' },
  ];

  protected readonly memberSearchQuery = signal('');
  protected readonly memberPage = signal(1);
  protected readonly memberPageSize = signal(10);

  protected readonly filteredMembers = computed(() => {
    const q = this.memberSearchQuery().toLowerCase();
    return this.allMembers.filter(
      (m) => !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  });

  protected readonly totalMemberRecords = computed(() => this.filteredMembers().length);

  protected readonly pagedMembers = computed<Record<string, unknown>[]>(() => {
    const start = (this.memberPage() - 1) * this.memberPageSize();
    return this.filteredMembers()
      .slice(start, start + this.memberPageSize())
      .map((m) => ({ ...m }));
  });

  protected readonly projects: Project[] = [
    {
      name: 'IT Supporting and Helpdesk',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'อ', color: '#f59e0b', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
        { initials: 'ส', color: '#3b82f6', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
        { initials: 'ม', color: '#10b981', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
        { initials: 'ป', color: '#8b5cf6', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
        { initials: 'ก', color: '#ef4444', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
        { initials: 'ข', color: '#f97316' },
        { initials: 'ค', color: '#607d8b' },
      ],
      highCount: 2,
      normalCount: 2,
      accentColor: '#3b82f6',
      attachmentCount: 2,
    },
    {
      name: 'Book Bank System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ก', color: '#ef4444' },
        { initials: 'ข', color: '#f59e0b' },
        { initials: 'ค', color: '#3b82f6' },
        { initials: 'ง', color: '#10b981' },
        { initials: 'จ', color: '#8b5cf6' },
        { initials: 'ฉ', color: '#f97316' },
      ],
      highCount: 2,
      normalCount: 2,
      accentColor: '#ef4444',
      attachmentCount: 2,
    },
    {
      name: 'Life Insurance System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'จ', color: '#8b5cf6' },
        { initials: 'ฉ', color: '#ef4444' },
        { initials: 'ช', color: '#f59e0b' },
        { initials: 'ซ', color: '#3b82f6' },
        { initials: 'ฌ', color: '#10b981' },
        { initials: 'ญ', color: '#f97316' },
      ],
      highCount: 2,
      normalCount: 2,
      accentColor: '#22c55e',
      attachmentCount: 2,
    },
    {
      name: 'Rent a car System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ด', color: '#10b981' },
        { initials: 'ต', color: '#8b5cf6' },
        { initials: 'ถ', color: '#ef4444' },
        { initials: 'ท', color: '#f59e0b' },
        { initials: 'น', color: '#3b82f6' },
        { initials: 'บ', color: '#f97316' },
      ],
      highCount: 2,
      normalCount: 2,
      accentColor: '#f59e0b',
      attachmentCount: 2,
    },
    {
      name: 'Library Management System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ป', color: '#8b5cf6' },
        { initials: 'ผ', color: '#ef4444' },
        { initials: 'ฝ', color: '#f59e0b' },
        { initials: 'พ', color: '#3b82f6' },
        { initials: 'ฟ', color: '#10b981' },
        { initials: 'ภ', color: '#f97316' },
      ],
      highCount: 2,
      normalCount: 2,
      accentColor: '#3b82f6',
      attachmentCount: 2,
    },
    {
      name: 'Room Service System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ม', color: '#ef4444' },
        { initials: 'ย', color: '#f59e0b' },
        { initials: 'ร', color: '#3b82f6' },
        { initials: 'ล', color: '#10b981' },
        { initials: 'ว', color: '#8b5cf6' },
        { initials: 'ศ', color: '#f97316' },
      ],
      highCount: 2,
      normalCount: 2,
      accentColor: '#ef4444',
      attachmentCount: 2,
    },
    {
      name: 'Tour Ticket Booking System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ษ', color: '#22c55e' },
        { initials: 'ส', color: '#ef4444' },
        { initials: 'ห', color: '#f59e0b' },
        { initials: 'อ', color: '#3b82f6' },
        { initials: 'ฮ', color: '#10b981' },
        { initials: 'ก', color: '#f97316' },
      ],
      highCount: 2,
      normalCount: 2,
      accentColor: '#22c55e',
      attachmentCount: 2,
    },
    {
      name: 'Manage Pharmacy System',
      status: 'Open',
      date: '10/07/66',
      owner: 'บริษัท ร่ำรวย จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ข', color: '#f59e0b' },
        { initials: 'ค', color: '#3b82f6' },
        { initials: 'ง', color: '#10b981' },
        { initials: 'จ', color: '#8b5cf6' },
        { initials: 'ฉ', color: '#ef4444' },
        { initials: 'ช', color: '#f97316' },
      ],
      highCount: 2,
      normalCount: 2,
      accentColor: '#f59e0b',
      attachmentCount: 2,
    },
  ];

  protected onBack(): void {
    this.router.navigate(['/company-management/list']);
  }

  protected onEdit(): void {
    this.router.navigate(['/company-management/edit', this.companyName]);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onMemberSearch(value: string): void {
    this.memberSearchQuery.set(value);
    this.memberPage.set(1);
  }

  protected onMemberPageChange(page: number): void {
    this.memberPage.set(page);
  }

  protected onMemberPageSizeChange(size: number): void {
    this.memberPageSize.set(size);
    this.memberPage.set(1);
  }

  protected onConfirmDelete(): void {
    this.showConfirmDeleteDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'ลบบริษัทสำเร็จ',
      detail: 'ลบข้อมูลบริษัทเรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/company-management/list']);
  }
}
