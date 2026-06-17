import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FeedItem, CommentItem, AssigneeUser, FeedUser } from './ticket-detail.types';
import { TicketCommentFeedComponent } from './components/ticket-comment-feed/ticket-comment-feed.component';
import { TicketInfoPanelComponent } from './components/ticket-info-panel/ticket-info-panel.component';

@Component({
  selector: 'app-ticket-detail',
  imports: [FormsModule, Button, InputText, TicketCommentFeedComponent, TicketInfoPanelComponent],
  templateUrl: './ticket-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  protected readonly isEditingTitle = signal(false);
  protected readonly title = signal('เซิฟล่ม');
  protected readonly titleDraft = signal('');
  protected readonly submittingComment = signal(false);

  protected readonly feedItems = signal<FeedItem[]>([
    {
      type: 'comment',
      id: '1',
      author: { name: 'ผมชื่อ ลูกค้าครับ', avatarInitial: 'ผ', avatarColor: '#64748b' },
      content: 'เซิฟล่มครับ',
      timestamp: 'วันจันทร์ที่ 3 ก.ค. 2566 เวลา 15:30 น.',
    },
    {
      type: 'activity',
      id: 'act-1',
      actor: 'ส่วนผม นักพัฒนาครับ',
      action: 'เปลี่ยนสถานะ Ticket เป็น',
      statusLabel: 'Pending',
      timestamp: 'วันจันทร์ที่ 3 ก.ค. 2566 เวลา 15:50 น.',
    },
    {
      type: 'comment',
      id: '2',
      author: { name: 'ส่วนผม นักพัฒนาครับ', avatarInitial: 'ส', avatarColor: '#3b82f6' },
      content: 'กำลังตรวจสอบให้ครับ',
      timestamp: 'วันจันทร์ที่ 3 ก.ค. 2566 เวลา 16:00 น.',
    },
  ]);

  protected readonly assigneeList = signal<AssigneeUser[]>([
    { id: '1', name: 'ส่วนผม นักพัฒนาครับ', role: 'Developer', avatarInitial: 'ส', avatarColor: '#3b82f6', selected: true },
    { id: '2', name: 'ชื่อ นามสกุล', role: 'Developer', avatarInitial: 'ช', avatarColor: '#8b5cf6', selected: false },
    { id: '3', name: 'ชื่อ นามสกุล', role: 'Developer', avatarInitial: 'ช', avatarColor: '#64748b', selected: false },
    { id: '4', name: 'ชื่อ นามสกุล', role: 'Developer', avatarInitial: 'ช', avatarColor: '#f59e0b', selected: false },
    { id: '5', name: 'ชื่อ นามสกุล', role: 'Developer', avatarInitial: 'ช', avatarColor: '#ec4899', selected: false },
  ]);

  protected readonly requester: FeedUser = {
    name: 'ผมชื่อ ลูกค้าครับ',
    avatarInitial: 'ผ',
    avatarColor: '#64748b',
  };

  protected goBack(): void {
    this.router.navigate(['/ticket-management/list']);
  }

  protected onStartEditTitle(): void {
    this.titleDraft.set(this.title());
    this.isEditingTitle.set(true);
  }

  protected onSaveTitle(): void {
    const draft = this.titleDraft().trim();
    if (draft) this.title.set(draft);
    this.isEditingTitle.set(false);
    this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: 'บันทึกชื่อ Ticket แล้ว', life: 3000 });
  }

  protected onCommentSubmit(text: string): void {
    this.submittingComment.set(true);
    setTimeout(() => {
      this.feedItems.update((items) => [
        ...items,
        {
          type: 'comment',
          id: String(Date.now()),
          author: { name: 'ใจงาม สุดใจจริง', avatarInitial: 'ใ', avatarColor: '#22c55e' },
          content: text,
          timestamp: 'เพิ่งส่ง',
        } satisfies CommentItem,
      ]);
      this.submittingComment.set(false);
    }, 300);
  }

  protected onAssigneeToggle(id: string): void {
    this.assigneeList.update((list) =>
      list.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)),
    );
  }
}
