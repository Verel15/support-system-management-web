import { ChangeDetectionStrategy, Component, inject, output, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { FileUploadComponent } from '../../../../../../shared/components/file-upload';
import { AddProjectStore } from '../../add-project.store';

@Component({
  selector: 'app-step1-project-info',
  imports: [ReactiveFormsModule, Button, DatePicker, InputText, Popover, FileUploadComponent],
  templateUrl: './step1-project-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step1ProjectInfoComponent {
  protected readonly store = inject(AddProjectStore);
  protected readonly colorPickerRef = viewChild.required<Popover>('colorPicker');
  protected readonly today = new Date();

  readonly next = output<void>();

  get controls() {
    return this.store.step1Form.controls;
  }

  protected openColorPicker(event: MouseEvent): void {
    this.colorPickerRef().toggle(event);
  }

  protected selectColor(value: string): void {
    this.store.step1Form.controls.projectColor.setValue(value);
    this.colorPickerRef().hide();
  }

  protected onFilesChange(files: File[]): void {
    this.store.uploadedFiles.set(files);
  }

  protected onNext(): void {
    this.store.step1Form.markAllAsTouched();
    if (this.store.step1Valid()) {
      this.next.emit();
    }
  }
}
