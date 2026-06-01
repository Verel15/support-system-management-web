# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build
npm run watch      # Development build with watch mode
npm test           # Run tests with Vitest
```

There is no lint script configured; use `npx ng lint` if lint tooling is added.

## Architecture

Angular 21 application using **standalone components only** (no NgModules). All feature routes are lazy-loaded.

**Stack:**
- Angular 21 + TypeScript 5.9 (strict mode)
- PrimeNG 21 + `@primeuix/themes` Aura preset — primary UI library
- Angular Material 21 — installed but use PrimeNG first; Angular Material is secondary
- Tailwind CSS 4 — layout and spacing only, no PrimeFlex
- Vitest — test runner (via `@angular/build:unit-test`)

**Entry points:**
- `src/main.ts` — bootstraps `AppComponent`
- `src/app/app.config.ts` — global providers: router, PrimeNG theme, `MessageService`
- `src/app/app.routes.ts` — root routes, lazy-loads feature route files
- `src/app/app.ts` + `src/app/app.html` — root component (renders `<p-toast>` + `<router-outlet>`)

**Global styles:**
- `src/styles.css` — Tailwind CSS 4 entry, PrimeIcons import, custom `@theme` color tokens, IBM Plex Sans Thai font (globally applied via `*`)
- `src/material-theme.scss` — Angular Material theme (azure/blue palette)

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## UI Component Library

- Use **PrimeNG** as the primary UI component library for all UI elements (buttons, inputs, tables, dialogs, etc.)
- Always import PrimeNG components individually (standalone imports) — do not import the entire `PrimeNGModule`
- Use PrimeNG's built-in themes via `providePrimeNG()` in `app.config.ts`
- Use **Tailwind CSS 4** for layout and spacing utilities alongside PrimeNG components — do NOT use PrimeFlex
- Use **PrimeIcons** for icons — do not mix with other icon libraries unless necessary
- When a PrimeNG component exists for a use case, always prefer it over building a custom component from scratch

## Color Token System

Custom Tailwind CSS 4 color tokens are defined in `src/styles.css` under `@theme`. Use these tokens for consistency:

| Token prefix | Color | Usage |
|---|---|---|
| `primary-{50–950}` | Green | Actions, CTAs, links, active states |
| `secondary-{50–950}` | Slate | Neutral UI, borders, muted text |
| `error-{50–950}` | Red | Validation errors, destructive actions |
| `warning-{50–950}` | Amber | Warnings, cautions |

The PrimeNG primary palette is mapped to the same green values (`{green.*}` in `app.config.ts`), so `--p-primary-500` equals `--color-primary-500` (#22c55e).

**In templates:**
- Tailwind: `text-primary-500`, `bg-secondary-100`, `border-error-300`
- PrimeNG CSS vars: `var(--p-primary-500)`, `var(--p-primary-600)` (for PrimeNG-aware contexts)

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Project Structure

```
src/app/
├── core/                          # Guards, interceptors, singleton services
├── shared/
│   ├── components/
│   │   ├── alert-dialog/          # Reusable confirmation/alert dialog (4 types: error/success/warning/info)
│   │   └── data-table/            # Reusable table + pagination component (see below)
│   ├── directives/
│   └── pipes/
└── features/
    └── auth/                      # Auth feature (lazy-loaded)
        ├── components/
        │   ├── auth-layout/       # Layout wrapper for all auth pages
        │   ├── login/
        │   ├── forgot-password/
        │   ├── check-email/
        │   └── reset-password/
        ├── store/                 # Signal-based feature store (auth.store.ts)
        └── auth.routes.ts
```

### Structure Conventions

- **Core**: Guards, interceptors, and singleton services shared across the entire app.
- **Shared**: Reusable standalone components, directives, and pipes.
- **Features**: Each feature is self-contained with its own components, services, and routes. Features are lazy-loaded via the router — never eagerly imported.
- **File placement**: Place files in the folder matching their role. Do not create files at the wrong level of the hierarchy.

## Reusable Shared Components

### `app-data-table` (`shared/components/data-table/`)

Generic server-driven table with built-in pagination. All state (page, sort) is controlled externally.

```typescript
import { DataTableComponent, DataTableCellDirective, TableColumn } from '@app/shared/components/data-table';

// Column definition
columns: TableColumn[] = [
  { field: 'title', header: 'หัวข้องาน', sortable: true, width: '200px' },
  { field: 'status', header: 'สถานะ' },
];
```

```html
<app-data-table
  [columns]="columns"
  [data]="rows()"
  [totalRecords]="total()"
  [currentPage]="page()"
  [pageSize]="pageSize()"
  [loading]="loading()"
  (pageChange)="page.set($event)"
  (pageSizeChange)="pageSize.set($event)"
  (sortChange)="onSort($event)"
  (actionClick)="onAction($event)"
>
  <!-- Custom cell for any column -->
  <ng-template dataTableCell="status" let-value="value">
    <p-tag [value]="value"></p-tag>
  </ng-template>

  <!-- Override the default (...) actions button -->
  <ng-template dataTableCell="_actions" let-row>
    <p-button icon="pi pi-ellipsis-h" (onClick)="menu.toggle($event)"></p-button>
  </ng-template>
</app-data-table>
```

The `_actions` reserved field overrides the default ellipsis button. Each cell template receives `{ $implicit: row, value: cellValue }` as context.

### `app-alert-dialog` (`shared/components/alert-dialog/`)

Modal dialog for confirmations and notifications. Supports `error | success | warning | info` types. Uses `model()` for two-way `visible` binding.

## Toasts

`MessageService` (from `primeng/api`) is provided globally in `app.config.ts`. Inject it in any component or service to show toasts. The `<p-toast>` is rendered once in `app.html`.

```typescript
private messageService = inject(MessageService);

this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: '...', life: 3000 });
```
