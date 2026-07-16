import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import {
  GlobalSearchEntityType,
  GlobalSearchResult,
  GlobalSearchService,
} from '../../../core/services/global-search.service';

const TYPE_META: Record<GlobalSearchEntityType, { icon: string; sectionLabel: string }> = {
  TICKET: { icon: 'pi-ticket', sectionLabel: 'tickets' },
  PROJECT: { icon: 'pi-folder', sectionLabel: 'projects' },
  USER: { icon: 'pi-user', sectionLabel: 'users' },
};
const TYPE_ORDER: GlobalSearchEntityType[] = ['TICKET', 'PROJECT', 'USER'];

export interface CommandPaletteResultRow extends GlobalSearchResult {
  /** Index within the flat results() array — drives keyboard nav + active state */
  flatIndex: number;
  titleBefore: string;
  titleMatch: string;
  titleAfter: string;
}

export interface CommandPaletteSection {
  type: GlobalSearchEntityType;
  label: string;
  rows: CommandPaletteResultRow[];
}

@Component({
  selector: 'app-command-palette',
  imports: [Dialog],
  templateUrl: './command-palette.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteComponent {
  visible = model(false);

  private readonly router = inject(Router);
  private readonly searchService = inject(GlobalSearchService);

  protected readonly query = signal('');
  protected readonly loading = signal(false);
  protected readonly results = signal<GlobalSearchResult[]>([]);
  protected readonly activeIndex = signal(0);
  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly hasSearched = computed(() => this.query().trim().length > 0);

  protected readonly sections = computed<CommandPaletteSection[]>(() => {
    const q = this.query().trim();
    const rows = this.results();
    return TYPE_ORDER.map((type) => ({
      type,
      label: TYPE_META[type].sectionLabel,
      rows: rows
        .map((result, flatIndex) => ({ result, flatIndex }))
        .filter(({ result }) => result.type === type)
        .map(({ result, flatIndex }) => ({
          ...result,
          flatIndex,
          ...this.splitTitle(result.title, q),
        })),
    })).filter((section) => section.rows.length > 0);
  });

  private splitTitle(title: string, query: string): { titleBefore: string; titleMatch: string; titleAfter: string } {
    if (!query) return { titleBefore: title, titleMatch: '', titleAfter: '' };
    const idx = title.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return { titleBefore: title, titleMatch: '', titleAfter: '' };
    return {
      titleBefore: title.slice(0, idx),
      titleMatch: title.slice(idx, idx + query.length),
      titleAfter: title.slice(idx + query.length),
    };
  }

  constructor() {
    toObservable(this.query)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          const trimmed = q.trim();
          if (!trimmed) {
            this.loading.set(false);
            return of<GlobalSearchResult[]>([]);
          }
          this.loading.set(true);
          return this.searchService.search(trimmed).pipe(
            catchError(() => of<GlobalSearchResult[]>([])),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((results) => {
        this.loading.set(false);
        this.results.set(results);
        this.activeIndex.set(0);
      });

    effect(() => {
      if (this.visible()) {
        this.query.set('');
        this.results.set([]);
        this.activeIndex.set(0);
        queueMicrotask(() => this.searchInput()?.nativeElement.focus());
      }
    });
  }

  protected iconFor(type: GlobalSearchEntityType): string {
    return TYPE_META[type].icon;
  }

  protected onQueryInput(value: string): void {
    this.query.set(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const total = this.results().length;
    if (!total) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.set((this.activeIndex() + 1) % total);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set((this.activeIndex() - 1 + total) % total);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const result = this.results()[this.activeIndex()];
      if (result) this.select(result);
    }
  }

  protected select(result: GlobalSearchResult): void {
    this.visible.set(false);

    switch (result.type) {
      case 'TICKET':
        this.router.navigate(['/ticket-management/detail', result.id]);
        break;
      case 'PROJECT':
        this.router.navigate(['/project-management/detail'], { queryParams: { id: result.id } });
        break;
      case 'USER':
        this.router.navigate(['/user-management/detail', result.id]);
        break;
    }
  }
}
