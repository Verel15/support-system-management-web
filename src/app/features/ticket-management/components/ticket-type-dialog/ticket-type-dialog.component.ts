import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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

export type { SelectedTicketType } from './ticket-type-dialog.types';

const TICKET_TYPES: TicketTypeNode[] = [
  {
    id: 'incident',
    name: 'Incident',
    categories: [
      {
        id: 'network',
        name: 'Network',
        subCategories: [
          { id: 'network-outage', name: 'Network Outage', team: 'EVT-TEAM', level: 'Critical', resolutionTime: '1 ชั่วโมง' },
          { id: 'network-slow', name: 'Network Slow Performance', team: 'EVT-TEAM', level: 'Important', resolutionTime: '4 ชั่วโมง' },
          { id: 'network-security', name: 'Network Security Breach', team: 'EVT-TEAM', level: 'Critical', resolutionTime: '1 ชั่วโมง' },
        ],
      },
      {
        id: 'server',
        name: 'Server',
        subCategories: [
          { id: 'server-down', name: 'Server Down', team: 'EVT-TEAM', level: 'Critical', resolutionTime: '2 ชั่วโมง' },
          { id: 'server-high-cpu', name: 'High CPU Usage', team: 'EVT-TEAM', level: 'Important', resolutionTime: '4 ชั่วโมง' },
        ],
      },
    ],
  },
  {
    id: 'service-request',
    name: 'Service request',
    categories: [
      {
        id: 'software-install',
        name: 'Software Installation',
        subCategories: [
          { id: 'new-software', name: 'New Software Request', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '8 ชั่วโมง' },
          { id: 'software-update', name: 'Software Update', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '4 ชั่วโมง' },
        ],
      },
      {
        id: 'hardware',
        name: 'Hardware',
        subCategories: [
          { id: 'hardware-replace', name: 'Hardware Replacement', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '1 วัน' },
          { id: 'new-device', name: 'New Device Setup', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '1 วัน' },
        ],
      },
    ],
  },
  {
    id: 'change-request',
    name: 'Change Request',
    categories: [
      {
        id: 'software',
        name: 'Software',
        subCategories: [
          { id: 'feature-enhancement', name: 'Feature Enhancement', team: 'EVT-TEAM', level: 'Important', resolutionTime: '3 วัน' },
          { id: 'bug-fix', name: 'Bug Fix', team: 'EVT-TEAM', level: 'Important', resolutionTime: '1 วัน' },
        ],
      },
      {
        id: 'hardware-upgrades',
        name: 'Hardware Upgrades',
        subCategories: [
          { id: 'storage-upgrade', name: 'Storage Device Upgrade', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '2 วัน' },
          { id: 'memory-upgrade', name: 'Memory Upgrade', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '1 วัน' },
        ],
      },
      {
        id: 'access-permissions',
        name: 'Access Permissions',
        subCategories: [
          { id: 'new-user-onboarding', name: 'New User Onboarding', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '4 ชั่วโมง' },
          { id: 'permission-update', name: 'Permission Update', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '4 ชั่วโมง' },
        ],
      },
      {
        id: 'user-support',
        name: 'User Support',
        subCategories: [
          { id: 'software-compat', name: 'Software Compatibility', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '2 ชั่วโมง' },
          { id: 'training', name: 'User Training', team: 'EVT-TEAM', level: 'Normal', resolutionTime: '1 วัน' },
        ],
      },
      {
        id: 'security',
        name: 'Security',
        subCategories: [
          { id: 'iam', name: 'Security Identity and Access Management (IAM)', team: 'EVT-TEAM', level: 'Important', resolutionTime: '2 ชั่วโมง' },
          { id: 'security-policies', name: 'Security Policies and Procedures', team: 'EVT-TEAM', level: 'Important', resolutionTime: '3 วัน' },
          { id: 'security-incident', name: 'Security Incident Management', team: 'EVT-TEAM', level: 'Critical', resolutionTime: '1 ชั่วโมง' },
          { id: 'vuln-assessment', name: 'Vulnerability Assessment', team: 'EVT-TEAM', level: 'Important', resolutionTime: '2 วัน' },
        ],
      },
    ],
  },
  {
    id: 'information',
    name: 'Information',
    categories: [
      {
        id: 'general-inquiry',
        name: 'General Inquiry',
        subCategories: [
          { id: 'product-info', name: 'Product Information', team: 'EVT-TEAM', level: 'Low', resolutionTime: '1 วัน' },
          { id: 'service-info', name: 'Service Information', team: 'EVT-TEAM', level: 'Low', resolutionTime: '1 วัน' },
        ],
      },
    ],
  },
];

const TEAM_OPTIONS = [
  { label: 'EVT-TEAM', value: 'EVT-TEAM' },
  { label: 'DEV-TEAM', value: 'DEV-TEAM' },
  { label: 'OPS-TEAM', value: 'OPS-TEAM' },
];

const LEVEL_OPTIONS = [
  { label: 'Critical', value: 'Critical' },
  { label: 'Important', value: 'Important' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Low', value: 'Low' },
];

const RESOLUTION_OPTIONS = [
  { label: '1 ชั่วโมง', value: '1 ชั่วโมง' },
  { label: '2 ชั่วโมง', value: '2 ชั่วโมง' },
  { label: '4 ชั่วโมง', value: '4 ชั่วโมง' },
  { label: '8 ชั่วโมง', value: '8 ชั่วโมง' },
  { label: '1 วัน', value: '1 วัน' },
  { label: '2 วัน', value: '2 วัน' },
  { label: '3 วัน', value: '3 วัน' },
];

@Component({
  selector: 'app-ticket-type-dialog',
  imports: [FormsModule, Button, Dialog, IconField, InputIcon, InputText, Select],
  templateUrl: './ticket-type-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTypeDialogComponent {
  readonly visible = model(false);
  readonly confirmed = output<SelectedTicketType>();
  readonly cancelled = output<void>();

  protected readonly ticketTypes = TICKET_TYPES;
  protected readonly teamOptions = TEAM_OPTIONS;
  protected readonly levelOptions = LEVEL_OPTIONS;
  protected readonly resolutionOptions = RESOLUTION_OPTIONS;

  protected readonly searchQuery = signal('');
  protected readonly selectedTypeId = signal<string | null>(null);
  protected readonly selectedCategoryId = signal<string | null>(null);
  protected readonly selectedSubCategoryId = signal<string | null>(null);

  protected readonly selectedTeam = signal<string>('EVT-TEAM');
  protected readonly selectedLevel = signal<string>('Normal');
  protected readonly selectedResolution = signal<string>('1 วัน');

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.searchQuery.set('');
        this.selectedTypeId.set(null);
        this.selectedCategoryId.set(null);
        this.selectedSubCategoryId.set(null);
        this.selectedTeam.set('EVT-TEAM');
        this.selectedLevel.set('Normal');
        this.selectedResolution.set('1 วัน');
      }
    });

    effect(() => {
      const sub = this.activeSubCategory();
      if (sub) {
        this.selectedTeam.set(sub.team);
        this.selectedLevel.set(sub.level);
        this.selectedResolution.set(sub.resolutionTime);
      }
    });
  }

  protected readonly filteredTypes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.ticketTypes;
    return this.ticketTypes.filter(
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
    () => this.ticketTypes.find((t) => t.id === this.selectedTypeId()) ?? null,
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
    () => !!this.activeType() && !!this.activeCategory() && !!this.activeSubCategory(),
  );

  protected selectType(typeId: string): void {
    this.selectedTypeId.set(typeId);
    this.selectedCategoryId.set(null);
    this.selectedSubCategoryId.set(null);
  }

  protected selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
    this.selectedSubCategoryId.set(null);
  }

  protected selectSubCategory(subCategoryId: string): void {
    this.selectedSubCategoryId.set(subCategoryId);
  }

  protected onReset(): void {
    this.selectedTypeId.set(null);
    this.selectedCategoryId.set(null);
    this.selectedSubCategoryId.set(null);
    this.selectedTeam.set('EVT-TEAM');
    this.selectedLevel.set('Normal');
    this.selectedResolution.set('1 วัน');
  }

  protected onConfirm(): void {
    const type = this.activeType();
    const category = this.activeCategory();
    const sub = this.activeSubCategory();
    if (!type || !category || !sub) return;

    this.confirmed.emit({
      type: type.name,
      category: category.name,
      subCategory: sub.name,
      team: this.selectedTeam(),
      level: this.selectedLevel(),
      resolutionTime: this.selectedResolution(),
    });
    this.visible.set(false);
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.visible.set(false);
  }
}
