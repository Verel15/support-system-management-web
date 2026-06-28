import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Stepper, StepList, Step, StepPanels, StepPanel } from 'primeng/stepper';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { AddProjectStore } from '../../store/add-project.store';
import { ProjectService } from '../../services/project.service';
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
  private readonly projectService = inject(ProjectService);
  protected readonly store = inject(AddProjectStore);

  protected readonly activeStep = signal(1);
  protected readonly saving = signal(false);

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
    const form = this.store.step1Form.value;
    const startDate = form.startDate ? this.store.toIsoDate(form.startDate) : '';
    const endDate = form.endDate ? this.store.toIsoDate(form.endDate) : '';

    if (!form.companyId || !startDate || !endDate || !form.projectName) return;

    this.saving.set(true);

    this.projectService
      .create({
        name: form.projectName,
        color: form.projectColor ?? '#3b82f6',
        companyId: form.companyId,
        startDate,
        endDate,
      })
      .pipe(
        switchMap((project) => {
          const customerIds = this.store.selectedCustomerIds();
          const managerIds = this.store.selectedManagerIds();
          const files = this.store.uploadedFiles();

          const memberRequests = [
            ...customerIds.map((userId) =>
              this.projectService.addMember(project.id, { userId, role: 'CUSTOMER' }).pipe(catchError(() => of(null))),
            ),
            ...managerIds.map((userId) =>
              this.projectService.addMember(project.id, { userId, role: 'ASSIGNEE' }).pipe(catchError(() => of(null))),
            ),
          ];

          const docRequests = files.map((file) =>
            this.projectService.uploadDocument(project.id, file).pipe(catchError(() => of(null))),
          );

          const allRequests = [...memberRequests, ...docRequests];

          return (allRequests.length > 0 ? forkJoin(allRequests) : of([])).pipe(
            switchMap(() => of(project.id)),
          );
        }),
        catchError(() => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถสร้างโครงการได้',
            life: 3000,
          });
          return of(null);
        }),
      )
      .subscribe((projectId) => {
        this.saving.set(false);
        if (!projectId) return;
        this.messageService.add({
          severity: 'success',
          summary: 'บันทึกสำเร็จ',
          detail: 'สร้างโครงการใหม่เรียบร้อยแล้ว',
          life: 3000,
        });
        this.router.navigate(['/project-management/detail'], { queryParams: { id: projectId } });
      });
  }
}
