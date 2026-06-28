import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProjectCardComponent, Project } from '../../../../shared/components/project-card';

@Component({
  selector: 'app-my-project-list',
  imports: [FormsModule, Select, InputText, IconField, InputIcon, ProjectCardComponent],
  templateUrl: './my-project-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProjectListComponent {
  private readonly router = inject(Router);

  protected readonly selectedStatus = signal<string | null>(null);
  protected readonly selectedDate = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(8);
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
      id: '',
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
      id: '',
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
      id: '',
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
      id: '',
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
      id: '',
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

  protected readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.allProjects.filter((p) => {
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

  protected onProjectClick(project: Project): void {
    this.router.navigate(['/my-project/detail'], {
      queryParams: { name: project.name },
    });
  }
}
