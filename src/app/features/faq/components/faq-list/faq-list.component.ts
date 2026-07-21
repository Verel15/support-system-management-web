import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Button } from 'primeng/button';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { ChipComponent } from '../../../../shared/components/chip';
import { PaginationComponent } from '../../../../shared/components/data-table';
import { FaqService } from '../../../faq-management/services/faq.service';
import { FaqArticleResponse } from '../../../faq-management/interfaces/faq.interface';

@Component({
  selector: 'app-faq-list',
  imports: [
    FormsModule,
    Select,
    InputText,
    IconField,
    InputIcon,
    Button,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    ChipComponent,
    PaginationComponent,
  ],
  templateUrl: './faq-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqListComponent {
  private readonly router = inject(Router);
  private readonly faqService = inject(FaqService);

  protected readonly categoryOptions = signal<{ label: string; value: string | null }[]>([
    { label: 'ทั้งหมด', value: null },
  ]);
  protected readonly selectedCategory = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly articles = signal<FaqArticleResponse[]>([]);

  private readonly search$ = new Subject<string>();

  constructor() {
    this.faqService.getCategories().subscribe({
      next: (categories) => {
        this.categoryOptions.set([
          { label: 'ทั้งหมด', value: null },
          ...categories.map((c) => ({ label: c, value: c })),
        ]);
      },
      error: () => {
        // categories are a nice-to-have filter; failing silently keeps the FAQ list usable
      },
    });

    this.search$.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadArticles();
    });

    this.loadArticles();
  }

  private loadArticles(): void {
    this.loading.set(true);
    this.faqService
      .getPublished(this.currentPage() - 1, this.pageSize(), this.searchQuery(), this.selectedCategory())
      .subscribe({
        next: (res) => {
          this.articles.set(res.content);
          this.totalRecords.set(res.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.articles.set([]);
          this.totalRecords.set(0);
          this.loading.set(false);
        },
      });
  }

  protected onSearch(value: string): void {
    this.search$.next(value);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadArticles();
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadArticles();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadArticles();
  }

  protected onCreateTicket(): void {
    this.router.navigate(['/my-tickets/add']);
  }
}
