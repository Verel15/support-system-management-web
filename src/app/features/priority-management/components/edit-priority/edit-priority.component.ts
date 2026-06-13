import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
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
} from '../../priority.types';

@Component({
  selector: 'app-edit-priority',
  imports: [ReactiveFormsModule, Button, Select, Popover, Textarea],
  templateUrl: './edit-priority.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPriorityComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  protected readonly submitting = signal(false);
  protected readonly iconPicker = viewChild.required<Popover>('iconPicker');

  // TODO: pre-fill from route params / service
  protected readonly selectedIcon = signal<PriorityIconKey>('tri-up');
  protected readonly selectedColor = signal<PriorityColorKey>('red');

  protected readonly iconKeys = ICON_KEYS;
  protected readonly colorKeys = COLOR_KEYS;

  protected readonly durationOptions = [
    { label: '30 นาที', value: '30m' },
    { label: '1 ชั่วโมง', value: '1h' },
    { label: '2 ชั่วโมง', value: '2h' },
    { label: '4 ชั่วโมง', value: '4h' },
    { label: '8 ชั่วโมง', value: '8h' },
    { label: '1 วัน', value: '1d' },
    { label: '2 วัน', value: '2d' },
    { label: '3 วัน', value: '3d' },
    { label: '5 วัน', value: '5d' },
    { label: '7 วัน', value: '7d' },
  ];

  // TODO: pre-fill from route params / service
  protected readonly form = this.fb.group({
    name: ['มากมาก', Validators.required],
    duration: ['1d' as string | null, Validators.required],
    description: [''],
  });

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
    this.router.navigate(['/ticket-priority-management/detail']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    // TODO: call update priority API with this.selectedIcon(), this.selectedColor(), this.form.value
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'แก้ไขลำดับความสำคัญเรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-priority-management/detail']);
    this.submitting.set(false);
  }
}
