import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Popover } from 'primeng/popover';
import { Select } from 'primeng/select';
import { catchError, of } from 'rxjs';
import { ExistingFile, FileUploadComponent } from '../../../../shared/components/file-upload';
import { ProjectService } from '../../services/project.service';
import { CompanyService } from '../../../company-management/services/company.service';
import { CompanyResponse } from '../../../company-management/interfaces/company.interface';

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'น้ำเงิน' },
  { value: '#ef4444', label: 'แดง' },
  { value: '#22c55e', label: 'เขียว' },
  { value: '#f59e0b', label: 'เหลือง' },
  { value: '#8b5cf6', label: 'ม่วง' },
  { value: '#ec4899', label: 'ชมพู' },
  { value: '#06b6d4', label: 'ฟ้า' },
  { value: '#f97316', label: 'ส้ม' },
];

@Component({
  selector: 'app-edit-project',
  imports: [ReactiveFormsModule, Button, DatePicker, Popover, Select, FileUploadComponent],
  templateUrl: './edit-project.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProjectComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly projectService = inject(ProjectService);
  private readonly companyService = inject(CompanyService);

  protected readonly colorPickerRef = viewChild.required<Popover>('colorPicker');

  protected readonly colorOptions = COLOR_OPTIONS;
  protected readonly projectColor = signal('#3b82f6');
  protected readonly saving = signal(false);
  protected readonly companies = signal<CompanyResponse[]>([]);

  private projectId = '';

  protected readonly existingFiles = signal<ExistingFile[]>([]);

  protected readonly form = new FormGroup({
    projectName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    companyId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
    endDate: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
  });

  get controls() {
    return this.form.controls;
  }

  get companyOptions() {
    return this.companies().map((c) => ({ label: c.name, value: c.id }));
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.queryParamMap.get('id') ?? '';

    this.companyService.getAll().pipe(catchError(() => of([]))).subscribe((list) => {
      this.companies.set(list);
    });

    if (this.projectId) {
      this.projectService.getById(this.projectId).subscribe({
        next: (p) => {
          this.projectColor.set(p.color ?? '#3b82f6');
          this.form.patchValue({
            projectName: p.name,
            companyId: p.companyId,
            startDate: new Date(p.startDate),
            endDate: new Date(p.endDate),
          });
        },
      });

      this.projectService.getDocuments(this.projectId).subscribe({
        next: (docs) => {
          this.existingFiles.set(docs.map((d) => ({ id: d.id, name: d.fileName })));
        },
        error: () => {},
      });
    }
  }

  protected openColorPicker(event: MouseEvent): void {
    this.colorPickerRef().toggle(event);
  }

  protected selectColor(value: string): void {
    this.projectColor.set(value);
    this.colorPickerRef().hide();
  }

  protected onFilesChange(_files: File[]): void {}

  protected onExistingFileRemoved(id: string): void {
    if (this.projectId) {
      this.projectService.deleteDocument(this.projectId, id).pipe(catchError(() => of(null))).subscribe();
    }
    this.existingFiles.update((files) => files.filter((f) => f.id !== id));
  }

  protected goBack(): void {
    this.router.navigate(['/project-management/detail'], {
      queryParams: { id: this.projectId },
    });
  }

  protected onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { projectName, companyId, startDate, endDate } = this.form.value;
    if (!startDate || !endDate || !companyId || !projectName) return;

    this.saving.set(true);
    this.projectService
      .update(this.projectId, {
        name: projectName,
        color: this.projectColor(),
        companyId,
        startDate: this.toIsoDate(startDate),
        endDate: this.toIsoDate(endDate),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'บันทึกข้อมูลโครงการสำเร็จ',
            life: 3000,
          });
          this.router.navigate(['/project-management/detail'], {
            queryParams: { id: this.projectId },
          });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถบันทึกข้อมูลได้',
            life: 3000,
          });
        },
      });
  }

  private toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
