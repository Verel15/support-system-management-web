import {
  DescriptionPart,
  NotificationApiCategory,
  NotificationItem,
  NotificationResponse,
} from '../interfaces/notification.interface';

function getInitial(name: string): string {
  return name?.trim().charAt(0) ?? '?';
}

function getCategoryInfo(category: NotificationApiCategory): { icon: string; label: string } {
  switch (category) {
    case 'MY_TICKETS':
      return { icon: 'pi-ticket', label: 'Tickets ของฉัน' };
    case 'PROJECT':
      return { icon: 'pi-folder', label: 'โครงการ' };
    case 'TICKETS':
    default:
      return { icon: 'pi-ticket', label: 'Tickets ทั้งหมด' };
  }
}

type ChipSeverity = 'success' | 'warn' | 'info' | 'secondary' | 'danger' | 'contrast';

function statusGroupSeverity(group: string): ChipSeverity {
  switch (group) {
    case 'START':
      return 'info';
    case 'PROCESS':
      return 'warn';
    case 'SUCCESS':
      return 'success';
    case 'FAILED':
      return 'danger';
    default:
      return 'secondary';
  }
}

function buildDescriptionParts(n: NotificationResponse): DescriptionPart[] {
  if (n.type === 'TICKET_STATUS_CHANGED' && n.metadata) {
    const meta = n.metadata as {
      fromStatusName?: string;
      fromStatusGroup?: string;
      toStatusName?: string;
      toStatusGroup?: string;
    };
    if (meta.fromStatusName && meta.toStatusName) {
      return [
        { type: 'text', text: n.actorFullName, bold: true },
        { type: 'text', text: ' ได้ทำการอัพเดตสถานะ tickets จาก ' },
        {
          type: 'chip',
          chipLabel: meta.fromStatusName,
          chipSeverity: statusGroupSeverity(meta.fromStatusGroup ?? ''),
        },
        { type: 'text', text: ' เป็น ' },
        {
          type: 'chip',
          chipLabel: meta.toStatusName,
          chipSeverity: statusGroupSeverity(meta.toStatusGroup ?? ''),
        },
      ];
    }
  }
  return [{ type: 'text', text: n.message }];
}

export function formatNotificationTimeLabel(date: Date, todayBase: Date): string {
  const diff = todayBase.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return '';
  if (days < 7) return `${days} วัน`;
  const d = date;
  const thDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const thMonths = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ];
  const thYear = d.getFullYear() + 543;
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `วัน${thDays[d.getDay()]}ที่ ${d.getDate()} ${thMonths[d.getMonth()]} ${thYear} เวลา ${hh}:${mm} น.`;
}

export function toNotificationItem(n: NotificationResponse, todayBase: Date): NotificationItem {
  const { icon, label } = getCategoryInfo(n.category);
  const timestamp = new Date(n.createdAt);
  return {
    id: n.id,
    categoryIcon: icon,
    categoryLabel: label,
    titleSegments: [{ text: n.title, bold: false }],
    descriptionParts: buildDescriptionParts(n),
    isRead: n.read,
    actorName: n.actorFullName ?? '',
    actorInitial: getInitial(n.actorFullName ?? ''),
    avatarUrl: n.actorProfileImageUrl || undefined,
    timestamp,
    timeLabel: formatNotificationTimeLabel(timestamp, todayBase),
    entityType: n.entityType,
    entityId: n.entityId,
  };
}
