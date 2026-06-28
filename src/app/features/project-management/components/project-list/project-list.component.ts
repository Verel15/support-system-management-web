import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProjectCardComponent, Project } from '../../../../shared/components/project-card';
import { ProjectService } from '../../services/project.service';
import { ProjectResponse } from '../../interfaces/project.interface';

@Component({
  selector: 'app-project-list',
  imports: [FormsModule, Button, Select, InputText, IconField, InputIcon, ProjectCardComponent],
  templateUrl: './project-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  protected readonly isMyProjects = signal(false);
  protected readonly pageTitle = computed(() =>
    this.isMyProjects() ? 'โครงการของฉัน' : 'โครงการทั้งหมด',
  );

  protected readonly selectedStatus = signal<string | null>(null);
  protected readonly selectedDate = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(8);
  protected readonly loading = signal(false);

  private readonly allProjects = signal<Project[]>([]);

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

  constructor() {
    this.isMyProjects.set(this.router.url.includes('my-projects'));
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.loading.set(true);
    this.projectService.getAll(0, 200).subscribe({
      next: (page) => {
        this.allProjects.set(page.content.map((r) => this.mapToProject(r)));
        this.loading.set(false);
      },
      error: () => {
        this.allProjects.set([]);
        this.loading.set(false);
      },
    });
  }

  private readonly memberColors = [
    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
    '#ef4444', '#ec4899', '#f97316', '#06b6d4',
  ];

  private mapToProject(r: ProjectResponse): Project {
    const now = new Date();
    const end = new Date(r.endDate);
    const status: 'Open' | 'Closed' = now > end ? 'Closed' : 'Open';
    return {
      id: r.id,
      name: r.name,
      status,
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

  protected readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    return this.allProjects().filter((p) => {
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
  }

  protected onProjectClick(project: Project): void {
    this.router.navigate(['/project-management/detail'], {
      queryParams: { id: project.id },
    });
  }
}
