import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FeedItem, CommentItem, AssigneeUser, FeedUser } from './ticket-detail.types';
import { TicketCommentFeedComponent } from './components/ticket-comment-feed/ticket-comment-feed.component';
import { TicketInfoPanelComponent } from './components/ticket-info-panel/ticket-info-panel.component';
import { TicketService } from '../../services/ticket.service';
import {
  TicketDetailResponse,
  TicketTimelineItem,
  StatusItemResponse,
} from '../../interfaces/ticket.interface';

const AVATAR_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#64748b',
  '#f59e0b',
  '#ec4899',
  '#22c55e',
  '#ef4444',
  '#06b6d4',
];

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function avatarInitial(name: string): string {
  return name?.trim().charAt(0).toUpperCase() ?? '?';
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const thDate = new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(d);
  return thDate;
}

@Component({
  selector: 'app-ticket-detail',
  imports: [FormsModule, Button, InputText, TicketCommentFeedComponent, TicketInfoPanelComponent],
  templateUrl: './ticket-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly ticketService = inject(TicketService);

  private ticketId = '';

  protected readonly loading = signal(true);
  protected readonly ticket = signal<TicketDetailResponse | null>(null);
  protected readonly isEditingTitle = signal(false);
  protected readonly title = signal('');
  protected readonly titleDraft = signal('');
  protected readonly savingTitle = signal(false);
  protected readonly submittingComment = signal(false);
  protected readonly feedItems = signal<FeedItem[]>([]);
  protected readonly assigneeList = signal<AssigneeUser[]>([]);
  protected readonly statusItems = signal<StatusItemResponse[]>([]);
  private rawTimeline: TicketTimelineItem[] = [];

  protected readonly requester = computed<FeedUser>(() => {
    const t = this.ticket();
    if (!t) return { name: '—', avatarInitial: '?', avatarColor: '#64748b' };
    return {
      name: t.requesterFullName,
      avatarInitial: avatarInitial(t.requesterFullName),
      avatarColor: avatarColor(t.requesterId),
    };
  });

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    forkJoin({
      detail: this.ticketService.getById(this.ticketId),
      timeline: this.ticketService.getTimeline(this.ticketId),
    }).subscribe({
      next: ({ detail, timeline }) => {
        this.applyDetail(detail);
        this.applyTimeline(timeline);
        // load status flow statuses, then re-enrich timeline with group info
        this.ticketService.getStatusFlow(detail.statusFlowId).subscribe({
          next: (sf) => {
            this.statusItems.set(sf.statuses);
            this.applyTimeline(this.rawTimeline);
          },
          error: () => {},
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลด Ticket ได้',
          life: 3000,
        });
        this.router.navigate(['/ticket-management/list']);
      },
    });
  }

  private applyDetail(detail: TicketDetailResponse): void {
    this.ticket.set(detail);
    this.title.set(detail.title);
    this.assigneeList.set(
      detail.assignees.map((a) => ({
        id: a.id,
        userId: a.userId,
        name: a.fullName,
        role: '',
        avatarInitial: avatarInitial(a.fullName),
        avatarColor: avatarColor(a.userId),
        selected: true,
      })),
    );
  }

  private applyTimeline(items: TicketTimelineItem[]): void {
    this.rawTimeline = items;
    const statusMap = new Map(this.statusItems().map((s) => [s.id, s.group]));
    this.feedItems.set(
      items.map((item): FeedItem => {
        if (item.type === 'COMMENT') {
          return {
            type: 'comment',
            id: item.id,
            author: {
              name: item.authorFullName,
              avatarInitial: avatarInitial(item.authorFullName),
              avatarColor: avatarColor(item.authorId),
            },
            content: item.content ?? '',
            timestamp: formatDateTime(item.createdAt),
          } satisfies CommentItem;
        }
        return {
          type: 'activity',
          id: item.id,
          actor: item.authorFullName,
          action: 'เปลี่ยนสถานะ Ticket เป็น',
          statusLabel: item.toStatusName ?? '',
          statusGroup: item.toStatusId ? (statusMap.get(item.toStatusId) ?? null) : null,
          timestamp: formatDateTime(item.createdAt),
        };
      }),
    );
  }

  protected goBack(): void {
    this.router.navigate(['/ticket-management/list']);
  }

  protected onStartEditTitle(): void {
    this.titleDraft.set(this.title());
    this.isEditingTitle.set(true);
  }

  protected onSaveTitle(): void {
    const draft = this.titleDraft().trim();
    if (!draft) {
      this.isEditingTitle.set(false);
      return;
    }
    const t = this.ticket();
    if (!t) return;

    this.savingTitle.set(true);
    this.ticketService
      .update(this.ticketId, {
        title: draft,
        projectId: t.projectId,
        ticketTypeId: t.ticketTypeId,
        priorityId: t.priorityId,
        statusFlowId: t.statusFlowId,
        description: t.description ?? undefined,
      })
      .subscribe({
        next: (updated) => {
          this.title.set(updated.title);
          this.ticket.set(updated);
          this.isEditingTitle.set(false);
          this.savingTitle.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'บันทึกชื่อ Ticket แล้ว',
            life: 3000,
          });
        },
        error: () => {
          this.savingTitle.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถบันทึกชื่อ Ticket ได้',
            life: 3000,
          });
        },
      });
  }

  protected onCommentSubmit(text: string): void {
    this.submittingComment.set(true);
    this.ticketService.addComment(this.ticketId, { content: text }).subscribe({
      next: (item) => {
        this.feedItems.update((items) => [
          ...items,
          {
            type: 'comment',
            id: item.id,
            author: {
              name: item.authorFullName,
              avatarInitial: avatarInitial(item.authorFullName),
              avatarColor: avatarColor(item.authorId),
            },
            content: item.content ?? text,
            timestamp: formatDateTime(item.createdAt),
          } satisfies CommentItem,
        ]);
        this.submittingComment.set(false);
      },
      error: () => {
        this.submittingComment.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถส่งความคิดเห็นได้',
          life: 3000,
        });
      },
    });
  }

  protected onAssigneeAdd(userId: string): void {
    this.ticketService.addAssignee(this.ticketId, { userId }).subscribe({
      next: (a) => {
        const exists = this.assigneeList().some((x) => x.userId === userId);
        if (!exists) {
          this.assigneeList.update((list) => [
            ...list,
            {
              id: a.id,
              userId: a.userId,
              name: a.fullName,
              role: '',
              avatarInitial: avatarInitial(a.fullName),
              avatarColor: avatarColor(a.userId),
              selected: true,
            },
          ]);
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถเพิ่มผู้รับผิดชอบได้',
          life: 3000,
        });
      },
    });
  }

  protected onAssigneeRemove(userId: string): void {
    this.ticketService.removeAssignee(this.ticketId, userId).subscribe({
      next: () => {
        this.assigneeList.update((list) => list.filter((a) => a.userId !== userId));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบผู้รับผิดชอบได้',
          life: 3000,
        });
      },
    });
  }

  protected onStatusChange(toStatusId: string): void {
    this.ticketService.changeStatus(this.ticketId, { toStatusId }).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.loadTimeline();
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'เปลี่ยนสถานะแล้ว',
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถเปลี่ยนสถานะได้',
          life: 3000,
        });
      },
    });
  }

  private loadTimeline(): void {
    this.ticketService.getTimeline(this.ticketId).subscribe({
      next: (items) => this.applyTimeline(items),
      error: () => {},
    });
  }

  protected onDeleteTicket(): void {
    this.ticketService.delete(this.ticketId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'ลบ Ticket แล้ว',
          life: 3000,
        });
        this.router.navigate(['/ticket-management/list']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบ Ticket ได้',
          life: 3000,
        });
      },
    });
  }
}
