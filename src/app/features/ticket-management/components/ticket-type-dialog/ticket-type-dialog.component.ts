import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import {
  SelectedTicketType,
  TicketCategory,
  TicketSubCategory,
  TicketTypeNode,
} from './ticket-type-dialog.types';
import { TicketService } from '../../services/ticket.service';
import { PriorityResponse, TicketSubCategoryDetail } from '../../interfaces/ticket.interface';

export type { SelectedTicketType } from './ticket-type-dialog.types';

@Component({
  selector: 'app-ticket-type-dialog',
  imports: [FormsModule, Button, Dialog, IconField, InputIcon, InputText, Select],
  templateUrl: './ticket-type-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTypeDialogComponent implements OnInit {
  private readonly ticketService = inject(TicketService);

  readonly visible = model(false);
  readonly confirmed = output<SelectedTicketType>();
  readonly cancelled = output<void>();

  protected readonly ticketTypes = signal<TicketTypeNode[]>([]);
  protected readonly loadingTypes = signal(false);
  protected readonly loadingSubCategory = signal(false);
  protected readonly subCategoryDetail = signal<TicketSubCategoryDetail | null>(null);
  protected readonly priorityDetail = signal<PriorityResponse | null>(null);

  protected readonly searchQuery = signal('');
  protected readonly selectedTypeId = signal<string | null>(null);
  protected readonly selectedCategoryId = signal<string | null>(null);
  protected readonly selectedSubCategoryId = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.searchQuery.set('');
        this.selectedTypeId.set(null);
        this.selectedCategoryId.set(null);
        this.selectedSubCategoryId.set(null);
        this.subCategoryDetail.set(null);
        this.priorityDetail.set(null);
        if (this.ticketTypes().length === 0) {
          this.loadTypes();
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadTypes();
  }

  private loadTypes(): void {
    this.loadingTypes.set(true);
    this.ticketService.getTicketTypeSelector().subscribe({
      next: (data) => {
        this.ticketTypes.set(data);
        this.loadingTypes.set(false);
      },
      error: () => this.loadingTypes.set(false),
    });
  }

  protected readonly filteredTypes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.ticketTypes();
    return this.ticketTypes().filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.categories.some(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.subCategories.some((s) => s.name.toLowerCase().includes(query)),
        ),
    );
  });

  protected readonly activeType = computed<TicketTypeNode | null>(
    () => this.ticketTypes().find((t) => t.id === this.selectedTypeId()) ?? null,
  );

  protected readonly activeCategory = computed<TicketCategory | null>(
    () => this.activeType()?.categories.find((c) => c.id === this.selectedCategoryId()) ?? null,
  );

  protected readonly activeSubCategory = computed<TicketSubCategory | null>(
    () =>
      this.activeCategory()?.subCategories.find((s) => s.id === this.selectedSubCategoryId()) ??
      null,
  );

  protected readonly selectedPath = computed(() => {
    const parts: string[] = [];
    if (this.activeType()) parts.push(this.activeType()!.name);
    if (this.activeCategory()) parts.push(this.activeCategory()!.name);
    if (this.activeSubCategory()) parts.push(this.activeSubCategory()!.name);
    return parts.join(' > ');
  });

  protected readonly canConfirm = computed(
    () =>
      !!this.activeType() &&
      !!this.activeCategory() &&
      !!this.activeSubCategory() &&
      !!this.subCategoryDetail() &&
      !!this.priorityDetail() &&
      !this.loadingSubCategory(),
  );

  protected selectType(typeId: string): void {
    this.selectedTypeId.set(typeId);
    this.selectedCategoryId.set(null);
    this.selectedSubCategoryId.set(null);
    this.subCategoryDetail.set(null);
    this.priorityDetail.set(null);
  }

  protected selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
    this.selectedSubCategoryId.set(null);
    this.subCategoryDetail.set(null);
    this.priorityDetail.set(null);
  }

  protected selectSubCategory(subCategoryId: string): void {
    this.selectedSubCategoryId.set(subCategoryId);
    this.subCategoryDetail.set(null);
    this.priorityDetail.set(null);
    this.loadingSubCategory.set(true);
    this.ticketService.getSubCategoryDetail(subCategoryId).subscribe({
      next: (detail) => {
        this.subCategoryDetail.set(detail);
        this.ticketService.getPriorityById(detail.priorityLevelId).subscribe({
          next: (priority) => {
            this.priorityDetail.set(priority);
            this.loadingSubCategory.set(false);
          },
          error: () => this.loadingSubCategory.set(false),
        });
      },
      error: () => this.loadingSubCategory.set(false),
    });
  }

  protected onReset(): void {
    this.selectedTypeId.set(null);
    this.selectedCategoryId.set(null);
    this.selectedSubCategoryId.set(null);
    this.subCategoryDetail.set(null);
    this.priorityDetail.set(null);
  }

  protected onConfirm(): void {
    const type = this.activeType();
    const category = this.activeCategory();
    const sub = this.activeSubCategory();
    const detail = this.subCategoryDetail();
    const priority = this.priorityDetail();
    if (!type || !category || !sub || !detail || !priority) return;

    this.confirmed.emit({
      typeId: type.id,
      type: type.name,
      categoryId: category.id,
      category: category.name,
      subCategoryId: sub.id,
      subCategory: sub.name,
      statusFlowId: category.statusFlowId,
      statusFlowName: category.statusFlowName,
      priorityId: detail.priorityLevelId,
      priorityName: detail.priorityLevelName,
      priorityIntervalValue: priority.intervalValue,
      priorityIntervalUnit: priority.intervalUnit,
      positionName: detail.positionName,
    });
    this.visible.set(false);
  }

  protected intervalUnitLabel(unit: string): string {
    const map: Record<string, string> = {
      MINUTE: 'นาที',
      HOUR: 'ชั่วโมง',
      DAY: 'วัน',
      WEEK: 'สัปดาห์',
      MONTH: 'เดือน',
      YEAR: 'ปี',
    };
    return map[unit] ?? unit;
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.visible.set(false);
  }
}
