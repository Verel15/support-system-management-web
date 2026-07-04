import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProjectCardComponent, Project } from '../../../../shared/components/project-card';
import { ProjectService } from '../../../project-management/services/project.service';
import {
  ProjectDateRange,
  ProjectResponse,
  ProjectStatus,
} from '../../../project-management/interfaces/project.interface';

@Component({
  selector: 'app-my-project-list',
  imports: [FormsModule, Select, InputText, IconField, InputIcon, ProjectCardComponent],
  templateUrl: './my-project-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProjectListComponent {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  protected readonly selectedStatus = signal<ProjectStatus | null>(null);
  protected readonly selectedDate = signal<ProjectDateRange | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(8);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pagedProjects = signal<Project[]>([]);

  private readonly search$ = new Subject<string>();

  protected readonly statusOptions = [
    { label: 'สถานะ', value: null },
    { label: 'เปิด', value: 'OPEN' },
    { label: 'รอดำเนินการ', value: 'WAITING' },
    { label: 'ปิด', value: 'CLOSED' },
  ];

  protected readonly dateOptions = [
    { label: 'วันที่สร้าง', value: null },
    { label: 'วันนี้', value: 'TODAY' },
    { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
    { label: 'เดือนนี้', value: 'THIS_MONTH' },
  ];

  private readonly memberColors = [
    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
    '#ef4444', '#ec4899', '#f97316', '#06b6d4',
  ];

  constructor() {
    this.search$.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadProjects();
    });

    this.loadProjects();
  }

  private loadProjects(): void {
    this.loading.set(true);
    this.projectService
      .getMy(
        this.currentPage() - 1,
        this.pageSize(),
        this.searchQuery(),
        this.selectedDate(),
        this.selectedStatus(),
      )
      .subscribe({
        next: (page) => {
          this.pagedProjects.set(page.content.map((r) => this.mapToProject(r)));
          this.totalRecords.set(page.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.pagedProjects.set([]);
          this.totalRecords.set(0);
          this.loading.set(false);
        },
      });
  }

  private mapToProject(r: ProjectResponse): Project {
    return {
      id: r.id,
      name: r.name,
      status: r.status,
      date: this.formatDate(r.endDate),
      owner: r.companyName ?? '',
      totalTickets: 0,
      completedTickets: 0,
      members: (r.members ?? []).map((m, i) => ({
        initials: m.fullName.charAt(0),
        color: this.memberColors[i % this.memberColors.length],
        avatarUrl: m.profileImageUrl || undefined,
        fullName: m.fullName,
      })),
      highCount: 0,
      normalCount: 0,
      accentColor: r.color ?? '#3b82f6',
      attachmentCount: r.documentCount ?? 0,
    };
  }

  private formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = ((d.getFullYear() + 543) % 100).toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  protected onSearch(value: string): void {
    this.search$.next(value);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProjects();
  }

  protected onProjectClick(project: Project): void {
    this.router.navigate(['/my-project/detail'], {
      queryParams: { id: project.id },
    });
  }
}
