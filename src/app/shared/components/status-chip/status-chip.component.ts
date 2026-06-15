import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [],
  template: `<span [class]="classes()">{{ status() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  readonly status = input.required<string>();

  protected readonly classes = computed(() => {
    const val = this.status().toLowerCase().trim();
    let colorClasses = '';

    switch (val) {
      // Blue status (Open)
      case 'open':
      case 'เปิด':
      case 'ใช้งาน':
        colorClasses = 'bg-[#E3F2FD] text-[#0d6efd]';
        break;

      // Orange statuses (Pending, In Progress, In Review, etc.)
      case 'pending':
      case 'in progress':
      case 'in review':
      case 'รอดำเนินการ':
      case 'รอการอนุมัติ':
      case 'รออนุมัติ':
      case 'กำลังดำเนินการ':
      case 'รอการตรวจสอบ':
      case 'รอตรวจสอบ':
      case 'รอตอบกลับ':
        colorClasses = 'bg-[#FFF3E0] text-[#E65100]';
        break;

      // Green statuses (Done, Completed)
      case 'done':
      case 'เสร็จสิ้น':
      case 'สำเร็จ':
        colorClasses = 'bg-[#E8F5E9] text-[#2E7D32]';
        break;

      // Gray statuses (Close, Closed, Todo, Inactive)
      case 'close':
      case 'closed':
      case 'todo':
      case 'ปิด':
      case 'ไม่ใช้งาน':
        colorClasses = 'bg-[#ECEFF1] text-[#455A64]';
        break;

      // Red statuses (Return, Reject, Blocked)
      case 'return':
      case 'reject':
      case 'blocked':
      case 'ส่งคืน':
      case 'ส่งกลับ':
      case 'ปฏิเสธ':
      case 'ยกเลิก':
      case 'ระงับ':
        colorClasses = 'bg-[#FFEBEE] text-[#C62828]';
        break;

      default:
        // Default fallback
        colorClasses = 'bg-[#ECEFF1] text-[#455A64]';
        break;
    }

    return `inline-flex items-center justify-center px-5 py-1.5 rounded-full font-bold text-sm min-w-[96px] text-center ${colorClasses}`;
  });
}
