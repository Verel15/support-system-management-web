import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Stepper, StepList, Step, StepPanels, StepPanel } from 'primeng/stepper';
import { AddProjectStore } from '../../store/add-project.store';
import { Step1ProjectInfoComponent } from './steps/step1-project-info/step1-project-info.component';
import { Step2AddUsersComponent } from './steps/step2-add-users/step2-add-users.component';
import { Step3ReviewComponent } from './steps/step3-review/step3-review.component';

@Component({
  selector: 'app-add-project',
  imports: [
    Button,
    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
    Step1ProjectInfoComponent,
    Step2AddUsersComponent,
    Step3ReviewComponent,
  ],
  providers: [AddProjectStore],
  templateUrl: './add-project.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProjectComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  protected readonly activeStep = signal(1);

  protected onStepChange(value: number | undefined): void {
    if (value !== undefined) {
      this.activeStep.set(value);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/project-management/list']);
  }

  protected prevStep(): void {
    this.activeStep.update((s) => Math.max(1, s - 1));
  }

  protected nextStep(): void {
    this.activeStep.update((s) => Math.min(3, s + 1));
  }

  protected onSave(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'สร้างโครงการใหม่เรียบร้อยแล้ว',
      life: 3000,
    });
    this.router.navigate(['/project-management/list']);
  }
}
