import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProjectCardComponent, Project } from '../../../../shared/components/project-card';
import { HasPermissionDirective } from '../../../../shared/directives';
import { ProjectService } from '../../services/project.service';
import {
  PROJECT_DATE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  ProjectDateRange,
  ProjectResponse,
  ProjectStatus,
} from '../../interfaces/project.interface';

@Component({
  selector: 'app-project-list',
  imports: [
    FormsModule,
    Button,
    Select,
    InputText,
    IconField,
    InputIcon,
    ProjectCardComponent,
    HasPermissionDirective,
  ],
  templateUrl: './project-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  protected readonly isMyProjects = signal(false);
  protected readonly pageTitle = computed(() =>
    this.isMyProjects() ? 'โครงการของฉัน' : 'โครงการทั้งหมด',
  );

  protected readonly selectedStatus = signal<ProjectStatus | null>(null);
  protected readonly selectedDate = signal<ProjectDateRange | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(8);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pagedProjects = signal<Project[]>([]);

  private readonly search$ = new Subject<string>();

  protected readonly statusOptions = PROJECT_STATUS_OPTIONS;

  protected readonly dateOptions = PROJECT_DATE_OPTIONS;

  constructor() {
    this.isMyProjects.set(this.router.url.includes('my-projects'));

    this.search$.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadProjects();
    });

    this.loadProjects();
  }

  private loadProjects(): void {
    this.loading.set(true);
    const page = this.currentPage() - 1;
    const size = this.pageSize();
    const keyword = this.searchQuery();
    const dateRange = this.selectedDate();
    const status = this.selectedStatus();

    const request$ = this.isMyProjects()
      ? this.projectService.getMy(page, size, keyword, dateRange, status)
      : this.projectService.getAll(page, size, keyword, dateRange, status);

    request$.subscribe({
      next: (res) => {
        this.pagedProjects.set(res.content.map((r) => this.mapToProject(r)));
        this.totalRecords.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.pagedProjects.set([]);
        this.totalRecords.set(0);
        this.loading.set(false);
      },
    });
  }

  private readonly memberColors = [
    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
    '#ef4444', '#ec4899', '#f97316', '#06b6d4',
  ];

  private mapToProject(r: ProjectResponse): Project {
    return {
      id: r.id,
      name: r.name,
      status: r.status,
      date: this.formatDate(r.endDate),
      owner: r.companyName ?? '',
      totalTickets: r.totalTickets,
      successTicketCount: r.successTicketCount,
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

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProjects();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadProjects();
  }

  protected onAddProject(): void {
    this.router.navigate(['/project-management/add']);
  }

  protected onProjectClick(project: Project): void {
    this.router.navigate(['/project-management/detail'], {
      queryParams: { id: project.id },
    });
  }
}
