import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Popover } from 'primeng/popover';
import { Textarea } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import {
  type PriorityIconKey,
  type PriorityColorKey,
  ICON_CLASSES,
  ICON_KEYS,
  COLOR_HEX,
  COLOR_KEYS,
  DURATION_OPTIONS,
  ICON_SHAPE_MAP,
  ICON_COLOR_MAP,
  SHAPE_TO_ICON_KEY,
  COLOR_TO_COLOR_KEY,
  getDurationInterval,
  findDurationValue,
} from '../../interfaces/priority.interface';
import { PriorityService } from '../../services/priority.service';

@Component({
  selector: 'app-edit-priority',
  imports: [ReactiveFormsModule, Button, Select, Popover, Textarea],
  templateUrl: './edit-priority.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPriorityComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly priorityService = inject(PriorityService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly submitting = signal(false);
  protected readonly loading = signal(true);
  protected readonly iconPicker = viewChild.required<Popover>('iconPicker');

  protected readonly selectedIcon = signal<PriorityIconKey>('tri-up');
  protected readonly selectedColor = signal<PriorityColorKey>('orange');

  protected readonly iconKeys = ICON_KEYS;
  protected readonly colorKeys = COLOR_KEYS;
  protected readonly durationOptions = DURATION_OPTIONS;

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    duration: [null as string | null, Validators.required],
    description: [''],
  });

  constructor() {
    this.loadPriority();
  }

  private loadPriority(): void {
    this.priorityService.getById(this.id).subscribe({
      next: (res) => {
        this.selectedIcon.set(SHAPE_TO_ICON_KEY[res.iconShape]);
        this.selectedColor.set(COLOR_TO_COLOR_KEY[res.iconColor]);
        this.form.patchValue({
          name: res.name,
          duration: findDurationValue(res.intervalValue, res.intervalUnit),
          description: res.description ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลลำดับความสำคัญได้',
          life: 4000,
        });
        this.router.navigate(['/ticket-priority-management/list']);
      },
    });
  }

  protected iconClass(icon: PriorityIconKey): string {
    return ICON_CLASSES[icon];
  }

  protected colorHex(color: PriorityColorKey): string {
    return COLOR_HEX[color];
  }

  protected openIconPicker(event: MouseEvent): void {
    this.iconPicker().toggle(event);
  }

  protected selectIcon(icon: PriorityIconKey): void {
    this.selectedIcon.set(icon);
  }

  protected selectColor(color: PriorityColorKey): void {
    this.selectedColor.set(color);
  }

  protected isNameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isDurationInvalid(): boolean {
    const ctrl = this.form.get('duration');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-priority-management/detail', this.id]);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, duration, description } = this.form.value;
    const interval = getDurationInterval(duration!);
    if (!interval) return;

    this.submitting.set(true);
    this.priorityService
      .update(this.id, {
        name: name!,
        description: description || undefined,
        iconShape: ICON_SHAPE_MAP[this.selectedIcon()],
        iconColor: ICON_COLOR_MAP[this.selectedColor()],
        intervalValue: interval.intervalValue,
        intervalUnit: interval.intervalUnit,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'บันทึกสำเร็จ',
            detail: 'แก้ไขลำดับความสำคัญเรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/ticket-priority-management/detail', this.id]);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถแก้ไขลำดับความสำคัญได้',
            life: 4000,
          });
          this.submitting.set(false);
        },
      });
  }
}
