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
  selector: 'app-add-priority',
  imports: [ReactiveFormsModule, Button, Select, Popover, Textarea],
  templateUrl: './add-priority.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPriorityComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  protected readonly submitting = signal(false);
  protected readonly iconPicker = viewChild.required<Popover>('iconPicker');

  protected readonly selectedIcon = signal<PriorityIconKey>('tri-up');
  protected readonly selectedColor = signal<PriorityColorKey>('orange');

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

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    duration: [null as string | null, Validators.required],
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
    this.router.navigate(['/ticket-priority-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    // TODO: call create priority API with this.selectedIcon(), this.selectedColor(), this.form.value
    this.messageService.add({
      severity: 'success',
      summary: 'เพิ่มลำดับความสำคัญสำเร็จ',
      detail: 'สร้างลำดับความสำคัญใหม่เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-priority-management/list']);
    this.submitting.set(false);
  }
}
