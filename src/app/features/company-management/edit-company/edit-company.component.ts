import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { CompanyService } from '../services/company.service';

@Component({
  selector: 'app-edit-company',
  imports: [ReactiveFormsModule, Button, InputText],
  templateUrl: './edit-company.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCompanyComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly companyService = inject(CompanyService);

  protected readonly saving = signal(false);
  protected readonly loadingData = signal(true);

  private companyId = '';

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id') ?? '';
    this.companyService.getById(this.companyId).subscribe({
      next: (company) => {
        this.form.patchValue({ name: company.name });
        this.loadingData.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลบริษัทได้',
          life: 4000,
        });
        this.loadingData.set(false);
        this.router.navigate(['/company-management/list']);
      },
    });
  }

  protected isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  protected onBack(): void {
    this.router.navigate(['/company-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name } = this.form.getRawValue();
    this.saving.set(true);

    this.companyService.update(this.companyId, { name: name!, status: 'ACTIVE' }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'แก้ไขบริษัทเรียบร้อยแล้ว',
          life: 4000,
        });
        this.saving.set(false);
        this.router.navigate(['/company-management/list']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถแก้ไขบริษัทได้ กรุณาลองใหม่อีกครั้ง',
          life: 4000,
        });
        this.saving.set(false);
      },
    });
  }
}
