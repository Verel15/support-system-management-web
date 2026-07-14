import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-pagination',
  imports: [FormsModule, Select],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly totalRecords = input(0);
  readonly pageSize = input(10);
  readonly currentPage = input(1);
  readonly loading = input(false);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  private static idCounter = 0;
  protected readonly pageSizeSelectId = `pagination-page-size-${++PaginationComponent.idCounter}`;

  // Track viewport width so the number of visible page buttons adapts to screen size.
  private readonly viewportWidth = signal(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );

  constructor() {
    if (typeof window !== 'undefined') {
      const onResize = () => this.viewportWidth.set(window.innerWidth);
      window.addEventListener('resize', onResize, { passive: true });
      inject(DestroyRef).onDestroy(() =>
        window.removeEventListener('resize', onResize),
      );
    }
  }

  // Fewer buttons on narrow screens so the pagination never overflows horizontally.
  private readonly maxVisiblePages = computed(() => {
    const w = this.viewportWidth();
    if (w < 480) return 3;
    if (w < 640) return 5;
    if (w < 1024) return 7;
    return 10;
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords() / this.pageSize()))
  );

  protected readonly firstRecord = computed(() =>
    this.totalRecords() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  protected readonly lastRecord = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalRecords())
  );

  protected readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = this.maxVisiblePages();

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }
}
