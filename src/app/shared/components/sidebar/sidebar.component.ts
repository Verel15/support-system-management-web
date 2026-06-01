import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SidebarNavItem, SidebarUser } from './sidebar.types';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col h-screen bg-white border-r border-slate-200 shrink-0 overflow-hidden transition-[width] duration-300',
    '[class.w-[216px]]': '!collapsed()',
    '[class.w-14]': 'collapsed()',
  },
})
export class SidebarComponent {
  readonly personalNav = input<SidebarNavItem[]>([]);
  readonly mainNav = input<SidebarNavItem[]>([]);
  readonly user = input.required<SidebarUser>();
  readonly collapsed = model(false);

  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly expandedItems = signal(new Set<string>());

  readonly activeParentLabels = computed(() => {
    const url = this.currentUrl() ?? '';
    const set = new Set<string>();
    for (const item of this.mainNav()) {
      if (item.children?.some(child => !!child.route && url.startsWith(child.route))) {
        set.add(item.label);
      }
    }
    return set;
  });

  constructor() {
    effect(() => {
      const url = this.currentUrl() ?? '';
      const toExpand = this.mainNav()
        .filter(item => item.children?.some(child => !!child.route && url.startsWith(child.route)))
        .map(item => item.label);

      if (toExpand.length > 0) {
        this.expandedItems.update(set => new Set([...set, ...toExpand]));
      }
    });
  }

  isLinkActive(route: string | undefined): boolean {
    if (!route) return false;
    return (this.currentUrl() ?? '').startsWith(route);
  }

  isExpanded(label: string): boolean {
    return this.expandedItems().has(label);
  }

  toggleItem(label: string): void {
    this.expandedItems.update(set => {
      const next = new Set(set);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  toggleCollapsed(): void {
    this.collapsed.update(v => !v);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
