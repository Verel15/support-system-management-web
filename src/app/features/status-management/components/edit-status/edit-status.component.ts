import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  FormArray,
  Validators,
} from '@angular/forms';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-edit-status',
  imports: [
    ReactiveFormsModule,
    Button,
    InputText,
    Tooltip,
    Menu,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './edit-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStatusComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  protected readonly submitting = signal(false);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly editingIndex = signal(-1);

  // TODO: pre-fill from route params / service
  protected readonly createdBy = 'ใจงาม สุดใจจริง';
  protected readonly updatedDate = '18/07/66';
  protected readonly ticketCount = 56;

  protected readonly processingStatusControls = new FormArray<FormControl>([
    new FormControl('Pending', Validators.required),
    new FormControl('In Review', Validators.required),
  ]);

  protected readonly form = this.fb.group({
    name: ['EVT-DEV', Validators.required],
    processingStatuses: this.processingStatusControls,
  });

  protected menuItems: ActionMenuItem[] = [];

  protected getStatusControl(index: number): FormControl {
    return this.processingStatusControls.at(index) as FormControl;
  }

  protected isNameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isStatusInvalid(index: number): boolean {
    const ctrl = this.processingStatusControls.at(index);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected onMenuOpen(event: MouseEvent, index: number): void {
    this.menuItems = [
      { label: 'แก้ไขชื่อสถานะ', command: () => this.startEditing(index) },
      { separator: true },
      {
        label: 'ลบสถานะ',
        danger: true,
        command: () => this.removeProcessingStatus(index),
      },
    ];
    this.menu().toggle(event);
  }

  protected startEditing(index: number): void {
    this.editingIndex.set(index);
  }

  protected stopEditing(): void {
    this.editingIndex.set(-1);
  }

  protected addProcessingStatus(): void {
    this.processingStatusControls.push(new FormControl('', Validators.required));
    this.editingIndex.set(this.processingStatusControls.length - 1);
  }

  protected removeProcessingStatus(index: number): void {
    this.processingStatusControls.removeAt(index);
    if (this.editingIndex() === index) {
      this.editingIndex.set(-1);
    }
  }

  protected onDrop(event: CdkDragDrop<FormControl[]>): void {
    const controls = this.processingStatusControls.controls.slice() as FormControl[];
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    this.processingStatusControls.clear({ emitEvent: false });
    controls.forEach(ctrl =>
      this.processingStatusControls.push(ctrl, { emitEvent: false }),
    );
  }

  protected onBack(): void {
    this.router.navigate(['/status-management/detail']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    // TODO: call update status API
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'แก้ไขสถานะเรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/status-management/detail']);
    this.submitting.set(false);
  }
}
