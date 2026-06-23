import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { StatusFlowService } from '../../services/status-flow.service';
import { StatusFlowResponse } from '../../interfaces/status-flow.interface';

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
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly statusFlowService = inject(StatusFlowService);

  protected readonly submitting = signal(false);
  protected readonly loading = signal(true);
  protected readonly menu = viewChild<Menu>('actionMenu');
  protected readonly editingIndex = signal(-1);

  protected readonly statusData = signal<StatusFlowResponse | null>(null);
  private statusId = '';

  protected readonly processingStatusControls = new FormArray<FormControl>([]);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    processingStatuses: this.processingStatusControls,
  });

  protected menuItems: ActionMenuItem[] = [];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/status-management/list']);
      return;
    }
    this.statusId = id;
    this.statusFlowService.getById(id).subscribe({
      next: (data) => {
        this.statusData.set(data);
        this.form.patchValue({ name: data.name });
        const processItems = data.statuses
          .filter((s) => s.group === 'PROCESS' && !s.isSystem)
          .sort((a, b) => a.sequence - b.sequence);
        processItems.forEach((s) =>
          this.processingStatusControls.push(new FormControl(s.name, Validators.required)),
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลสถานะได้',
          life: 4000,
        });
        this.router.navigate(['/status-management/list']);
      },
    });
  }

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
    this.menu()?.toggle(event);
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
    controls.forEach((ctrl) =>
      this.processingStatusControls.push(ctrl, { emitEvent: false }),
    );
  }

  protected onBack(): void {
    this.router.navigate(['/status-management/detail', this.statusId]);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const name = this.form.get('name')!.value as string;
    const processStatuses = this.processingStatusControls.controls.map(
      (c) => c.value as string,
    );

    this.submitting.set(true);
    this.statusFlowService.update(this.statusId, { name, processStatuses }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'บันทึกสำเร็จ',
          detail: 'แก้ไขสถานะเรียบร้อยแล้ว',
          life: 4000,
        });
        this.router.navigate(['/status-management/detail', this.statusId]);
      },
      error: () => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถบันทึกสถานะได้',
          life: 4000,
        });
      },
    });
  }
}
