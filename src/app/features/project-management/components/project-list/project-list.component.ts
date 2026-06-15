import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProjectCardComponent, Project } from '../../../../shared/components/project-card';

@Component({
  selector: 'app-project-list',
  imports: [FormsModule, Button, Select, InputText, IconField, InputIcon, ProjectCardComponent],
  templateUrl: './project-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  private readonly router = inject(Router);

  protected readonly isMyProjects = signal(false);
  protected readonly pageTitle = computed(() =>
    this.isMyProjects() ? 'โครงการของฉัน' : 'โครงการทั้งหมด',
  );

  protected readonly selectedStatus = signal<string | null>(null);
  protected readonly selectedDate = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(8); // Show 8 project cards per page by default
  protected readonly loading = signal(false);

  protected readonly statusOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'เปิด', value: 'Open' },
    { label: 'ปิด', value: 'Closed' },
  ];

  protected readonly dateOptions = [
    { label: 'วันที่สร้าง', value: null },
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
  ];

  private readonly allProjects: Project[] = [
    {
      name: 'IT Supporting and Helpdesk',
      status: 'Open',
      date: '31/07/66',
      owner: 'ผู้รับ ข้าว จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'อ', color: '#f59e0b' },
        { initials: 'ส', color: '#3b82f6' },
        { initials: 'ม', color: '#10b981' },
        { initials: 'ป', color: '#8b5cf6' },
      ],
      highCount: 8,
      normalCount: 2,
      accentColor: '#3b82f6',
      attachmentCount: 2,
    },
    {
      name: 'Book Bank System',
      status: 'Open',
      date: '31/07/66',
      owner: 'ผู้รับ ข้าว จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ก', color: '#ef4444' },
        { initials: 'ข', color: '#f59e0b' },
        { initials: 'ค', color: '#3b82f6' },
        { initials: 'ง', color: '#10b981' },
      ],
      highCount: 6,
      normalCount: 2,
      accentColor: '#ef4444',
      attachmentCount: 2,
    },
    {
      name: 'Life Insurance System',
      status: 'Open',
      date: '31/07/66',
      owner: 'ผู้รับ ข้าว จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'จ', color: '#8b5cf6' },
        { initials: 'ฉ', color: '#ef4444' },
        { initials: 'ช', color: '#f59e0b' },
        { initials: 'ซ', color: '#3b82f6' },
      ],
      highCount: 8,
      normalCount: 3,
      accentColor: '#22c55e',
      attachmentCount: 3,
    },
    {
      name: 'Rent a car System',
      status: 'Open',
      date: '31/07/66',
      owner: 'ผู้รับ ข้าว จำกัด',
      totalTickets: 12,
      completedTickets: 10,
      members: [
        { initials: 'ด', color: '#10b981' },
        { initials: 'ต', color: '#8b5cf6' },
        { initials: 'ถ', color: '#ef4444' },
        { initials: 'ท', color: '#f59e0b' },
      ],
      highCount: 8,
      normalCount: 3,
      accentColor: '#f59e0b',
      attachmentCount: 3,
    },
    {
      name: 'CRM Portal Extension',
      status: 'Closed',
      date: '15/06/66',
      owner: 'บริษัท ดีไลท์ จำกัด',
      totalTickets: 8,
      completedTickets: 8,
      members: [
        { initials: 'ร', color: '#3b82f6' },
        { initials: 'ว', color: '#10b981' },
      ],
      highCount: 2,
      normalCount: 6,
      accentColor: '#64748b',
      attachmentCount: 1,
    },
    {
      name: 'HR Management Platform',
      status: 'Open',
      date: '02/08/66',
      owner: 'บริษัท เทคโนโลยี ทั่วไทย จำกัด',
      totalTickets: 25,
      completedTickets: 15,
      members: [
        { initials: 'น', color: '#ec4899' },
        { initials: 'พ', color: '#f59e0b' },
        { initials: 'อ', color: '#3b82f6' },
        { initials: 'ส', color: '#10b981' },
        { initials: 'ม', color: '#8b5cf6' },
        { initials: 'ก', color: '#ef4444' },
      ],
      highCount: 14,
      normalCount: 11,
      accentColor: '#ec4899',
      attachmentCount: 5,
    },
    {
      name: 'E-Learning Mobile App',
      status: 'Open',
      date: '20/08/66',
      owner: 'สถาบัน การเรียนรู้แห่งชาติ',
      totalTickets: 18,
      completedTickets: 5,
      members: [
        { initials: 'ศ', color: '#06b6d4' },
        { initials: 'ย', color: '#14b8a6' },
        { initials: 'ต', color: '#a855f7' },
      ],
      highCount: 10,
      normalCount: 8,
      accentColor: '#06b6d4',
      attachmentCount: 4,
    },
    {
      name: 'Warehouse API Integration',
      status: 'Closed',
      date: '10/05/66',
      owner: 'โลจิสติกส์ ไทยแลนด์',
      totalTickets: 15,
      completedTickets: 15,
      members: [
        { initials: 'อ', color: '#10b981' },
        { initials: 'ส', color: '#3b82f6' },
      ],
      highCount: 5,
      normalCount: 10,
      accentColor: '#10b981',
      attachmentCount: 2,
    },
    {
      name: 'Smart Billing System',
      status: 'Open',
      date: '12/09/66',
      owner: 'การไฟฟ้านครหลวง',
      totalTickets: 30,
      completedTickets: 20,
      members: [
        { initials: 'ณ', color: '#f97316' },
        { initials: 'ด', color: '#3b82f6' },
        { initials: 'ภ', color: '#10b981' },
      ],
      highCount: 12,
      normalCount: 18,
      accentColor: '#f97316',
      attachmentCount: 6,
    },
  ];

  constructor() {
    this.isMyProjects.set(this.router.url.includes('my-projects'));
  }

  protected readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const myProjectsOnly = this.isMyProjects();

    return this.allProjects.filter((p) => {
      // If "My Projects" page, only show projects where the user (initials 'อ' or 'ส') is a member
      if (myProjectsOnly) {
        const isMember = p.members.some((m) => m.initials === 'อ' || m.initials === 'ส');
        if (!isMember) return false;
      }

      const matchesSearch =
        !query || p.name.toLowerCase().includes(query) || p.owner.toLowerCase().includes(query);

      const matchesStatus = !status || p.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredProjects().length);

  protected readonly pagedProjects = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProjects().slice(start, start + this.pageSize());
  });

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  protected onAddProject(): void {
    this.router.navigate(['/project-management/add']);
    // TODO: implement open dialog/navigate to add project
  }
}
