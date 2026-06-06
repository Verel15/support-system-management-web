import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

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

  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    companyName: ['', [Validators.required, Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    const companyName = this.route.snapshot.paramMap.get('companyName') ?? '';
    this.form.patchValue({ companyName });
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
    this.saving.set(true);
    // TODO: call update API
    this.messageService.add({
      severity: 'success',
      summary: 'สำเร็จ',
      detail: 'แก้ไขบริษัทเรียบร้อยแล้ว',
      life: 4000,
    });
    this.saving.set(false);
    this.router.navigate(['/company-management/list']);
  }
}
