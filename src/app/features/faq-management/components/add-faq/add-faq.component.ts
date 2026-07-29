import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { TextEditorComponent } from '../../../../shared/components/text-editor/text-editor.component';
import { FaqService } from '../../services/faq.service';

@Component({
  selector: 'app-add-faq',
  imports: [ReactiveFormsModule, Button, InputText, AutoComplete, ToggleSwitch, TextEditorComponent],
  templateUrl: './add-faq.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFaqComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly faqService = inject(FaqService);

  protected readonly submitting = signal(false);
  protected readonly answerHtml = signal('');
  protected readonly answerTouched = signal(false);
  protected readonly categorySuggestions = signal<string[]>([]);
  private allCategories: string[] = [];

  protected readonly form = this.fb.group({
    question: ['', Validators.required],
    category: ['', Validators.required],
    isPublished: [false],
  });

  constructor() {
    this.faqService.getCategories().subscribe({
      next: (categories) => (this.allCategories = categories),
      error: () => (this.allCategories = []),
    });
  }

  protected isQuestionInvalid(): boolean {
    const ctrl = this.form.get('question');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isCategoryInvalid(): boolean {
    const ctrl = this.form.get('category');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isAnswerInvalid(): boolean {
    return this.answerTouched() && this.answerHtml().trim() === '';
  }

  protected onSearchCategory(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.categorySuggestions.set(
      this.allCategories.filter((c) => c.toLowerCase().includes(query)),
    );
  }

  protected onBack(): void {
    this.router.navigate(['/faq-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    this.answerTouched.set(true);
    if (this.form.invalid || this.answerHtml().trim() === '') return;

    const { question, category, isPublished } = this.form.value;

    this.submitting.set(true);
    this.faqService
      .create({
        question: question!,
        category: category!,
        answer: this.answerHtml(),
        isPublished: !!isPublished,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'เพิ่มบทความสำเร็จ',
            detail: 'สร้างบทความ FAQ ใหม่เรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/faq-management/list']);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถสร้างบทความ FAQ ได้',
            life: 4000,
          });
          this.submitting.set(false);
        },
      });
  }
}
