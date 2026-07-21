import { ChangeDetectionStrategy, Component, computed, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Rating } from 'primeng/rating';
import { Textarea } from 'primeng/textarea';

export interface SatisfactionRatingSubmit {
  score: number;
  comment: string;
}

const SCORE_LABELS: Record<number, string> = {
  1: 'แย่มาก ต้องปรับปรุง',
  2: 'ยังไม่ค่อยพอใจ',
  3: 'พอใช้',
  4: 'พอใจดี',
  5: 'เยี่ยมมาก ประทับใจ',
};

@Component({
  selector: 'app-ticket-satisfaction-dialog',
  imports: [FormsModule, Button, Dialog, Rating, Textarea],
  templateUrl: './ticket-satisfaction-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketSatisfactionDialogComponent {
  visible = model(false);

  submitted = output<SatisfactionRatingSubmit>();

  protected readonly score = signal(0);
  protected readonly comment = signal('');

  protected readonly scoreLabel = computed(() => SCORE_LABELS[this.score()] ?? '');

  protected onSubmit(): void {
    if (this.score() === 0) return;
    this.submitted.emit({ score: this.score(), comment: this.comment().trim() });
  }

  protected onHide(): void {
    this.score.set(0);
    this.comment.set('');
  }
}
