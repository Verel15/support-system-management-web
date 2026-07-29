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
- `@ngrx/signals` — `signalStore` for cross-feature state (currently only `AuthStore`)
- Vitest — test runner (via `@angular/build:unit-test`)
- Other notable deps: `chart.js` + `chartjs-plugin-datalabels` (dashboard charts), `date-fns` (date formatting), `jwt-decode` (JWT payload parsing), `quill` (rich text editor)

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

## Authentication & Authorization

State lives in `AuthStore` (`features/authentication/store/auth.store.ts`), an `@ngrx/signals` `signalStore` (`providedIn: 'root'`). Access/refresh tokens are stored as cookies (`core/utils/cookie.util.ts`); the user profile is cached in `localStorage`, but `permissions`/`accountType`/`userTypeId` are always re-decoded fresh from the JWT on hydration (backend can change a user's role mid-session).

- `store.isAuthenticated()`, `store.hasPermission()(permission)`, `store.hasRole()(...roles)` — computed signals, called as functions
- Permission flags are defined in `core/constants/permission.constant.ts` (`PERMISSIONS.*`); `accountType === 'ADMIN'` always passes `hasPermission`
- `authInterceptor` attaches `Authorization: Bearer` from the cookie and clears the session on `401`
- `errorInterceptor` toasts `403`/other errors via `MessageService` (401 is left to `authInterceptor`)

**Route guards** (`core/guards/`):
- `authGuard` — requires an authenticated session
- `guestGuard` — blocks authenticated users from auth pages (login, etc.)
- `nonCustomerGuard` — blocks `accountType === 'CUSTOMER'` from admin/management routes
- `permissionGuard(permission)` — factory guard checking a specific `PERMISSIONS` flag
- `unsavedChangesGuard` — `CanDeactivate`; component must implement `canDeactivate(): Observable<boolean> | boolean`

**Template-level gating** (`shared/directives/`): `*appHasPermission="'manageUserAccess'"` and `*appHasRole="['STAFF', 'ADMIN']"` show/hide elements reactively. All of the above are UX-only — the backend enforces authorization on every request; client-side checks are defense-in-depth, not the source of truth.

## API Layer

`ApiService` (`core/services/api.service.ts`, `providedIn: 'root'`) wraps `HttpClient` and unwraps the backend's `{ data, message, success }` envelope automatically — `get/post/put/patch/delete` all return `Observable<T>` of the unwrapped `data`. Use `downloadBlob(fileUrl)` for file downloads. Feature services should call `ApiService` rather than injecting `HttpClient` directly.

## Project Structure

```
src/app/
├── core/
│   ├── constants/permission.constant.ts   # PERMISSIONS map used by permissionGuard + directives
│   ├── guards/                            # auth, guest, non-customer, permission, unsaved-changes
│   ├── interceptors/                      # auth (token + 401), error (toast on failure)
│   ├── services/api.service.ts            # HttpClient wrapper, unwraps API envelope
│   └── utils/                             # cookie.util, jwt.util
├── shared/
│   ├── components/
│   │   ├── data-table/            # Reusable table + pagination component (see below)
│   │   ├── sidebar/                # Collapsible nav sidebar (see below)
│   │   ├── chip/                  # Generic chip/tag display
│   │   ├── status-chip/           # Status-specific chip with color coding
│   │   ├── project-card/          # Project summary card (shared)
│   │   ├── text-editor/           # Rich text editor wrapper (Quill)
│   │   ├── file-upload/           # File upload component
│   │   ├── file-preview-lightbox/ # Image/attachment preview lightbox
│   │   ├── command-palette/       # Global command/search palette
│   │   ├── not-found/             # 404 page component
│   │   └── dialogs/               # All dialog components
│   │       ├── alert-dialog/      # Info/success/warning/error notification dialog (1 button)
│   │       ├── confirm-dialog/    # Two-button confirm/cancel dialog
│   │       ├── delete-confirm-dialog/ # Password-required deletion dialog
│   │       ├── select-items-dialog/   # Multi-select searchable picker dialog
│   │       └── documents-dialog/      # Document/file list viewer dialog
│   ├── layouts/
│   │   ├── auth-layout/           # Layout wrapper for auth pages
│   │   └── main-layout/           # Authenticated layout: sidebar + router-outlet
│   ├── directives/                # has-permission, has-role (see Authentication & Authorization)
│   └── utils/date-format.util.ts
└── features/
    ├── authentication/            # /auth — uses AuthLayoutComponent
    │   ├── components/            # login, forgot-password, check-email, reset-password
    │   ├── store/                 # Signal-based auth store (auth.store.ts)
    │   └── authentication.routes.ts
    ├── dashboard/                 # /dashboard
    ├── my-tickets/                # /my-tickets
    ├── my-project/                # /my-project
    ├── project-management/        # /project-management
    ├── ticket-management/         # /ticket-management
    ├── notifications/             # /notifications
    ├── user-management/           # /user-management
    ├── user-type-management/      # /user-type-management
    ├── company-management/        # /company-management
    ├── status-management/         # /status-management
    ├── ticket-type-management/    # /ticket-type-management
    ├── priority-management/       # /ticket-priority-management
    ├── faq/                       # /faq
    ├── faq-management/            # /faq-management
    └── audit-log/                 # /audit-log
```

### Structure Conventions

- **Core**: Guards, interceptors, and singleton services shared across the entire app.
- **Shared**: Reusable standalone components and directives.
- **Features**: Each feature is self-contained with its own components, services, and routes. Features are lazy-loaded via the router — never eagerly imported.
- **File placement**: Place files in the folder matching their role. Do not create files at the wrong level of the hierarchy.

### Route Structure

`MainLayoutComponent` (sidebar + router-outlet) is the shell for all authenticated routes. Every feature except `/auth` uses it as a parent shell. Most management routes are gated by `nonCustomerGuard` plus a `permissionGuard(PERMISSIONS.*)` — check `app.routes.ts` for the exact flag per route.

```
/                             → redirectTo /dashboard
/auth                         → authentication feature (AuthLayoutComponent)
/dashboard                    → MainLayoutComponent (DASHBOARD_ACCESS)
/my-tickets                   → MainLayoutComponent
/my-project                   → MainLayoutComponent
/project-management           → MainLayoutComponent (ALL_PROJECT_ACCESS)
/ticket-management            → MainLayoutComponent (ALL_TICKET_ACCESS)
/notifications                → MainLayoutComponent
/user-management               → MainLayoutComponent (MANAGE_USER_ACCESS)
/user-type-management          → MainLayoutComponent (MANAGE_USER_ACCESS)
/company-management            → MainLayoutComponent (MANAGE_COMPANY_ACCESS)
/status-management              → MainLayoutComponent (MANAGE_DATA_ACCESS)
/ticket-type-management         → MainLayoutComponent (MANAGE_DATA_ACCESS)
/ticket-priority-management     → MainLayoutComponent (MANAGE_DATA_ACCESS)
/faq-management                 → MainLayoutComponent (MANAGE_DATA_ACCESS)
/faq                            → MainLayoutComponent
/audit-log                      → MainLayoutComponent (SYSTEM_LOG_ACCESS)
/not-found, /**                 → MainLayoutComponent → NotFoundComponent
```

## Reusable Shared Components

### `app-data-table` (`shared/components/data-table/`)

Generic server-driven table with built-in pagination. All state (page, sort) is controlled externally. Import from the barrel: `shared/components/data-table/index.ts`.

```typescript
import { DataTableComponent, DataTableCellDirective, TableColumn } from '../shared/components/data-table';

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
  (rowClick)="onRowClick($event)"
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

### `app-alert-dialog` (`shared/components/dialogs/alert-dialog/`)

Single-button modal for notifications. Supports `error | success | warning | info` types. Uses `model()` for two-way `visible` binding.

```html
<app-alert-dialog
  [(visible)]="showAlert"
  type="success"
  title="บันทึกสำเร็จ"
  (closed)="onClosed()"
/>
```

### `app-confirm-dialog` (`shared/components/dialogs/confirm-dialog/`)

Two-button confirm/cancel dialog. Supports `warning | info | error` types. The `loading` input disables buttons while async work runs.

```html
<app-confirm-dialog
  [(visible)]="showConfirm"
  type="warning"
  title="ยืนยันการลบ?"
  confirmLabel="ลบ"
  cancelLabel="ยกเลิก"
  [loading]="deleting()"
  (confirmed)="onConfirm()"
  (cancelled)="onCancel()"
/>
```

### `app-delete-confirm-dialog` (`shared/components/dialogs/delete-confirm-dialog/`)

Deletion dialog that requires the user to type a password before confirming. The `confirmed` output emits the typed password string.

```html
<app-delete-confirm-dialog
  [(visible)]="showDelete"
  targetLabel="ผู้ใช้ สมชาย ใจดี"
  [loading]="deleting()"
  (confirmed)="onDelete($event)"
  (cancelled)="onCancel()"
/>
```

### `app-sidebar` (`shared/components/sidebar/`)

Collapsible navigation sidebar used inside `MainLayoutComponent`. Accepts `personalNav` and `mainNav` arrays of `SidebarNavItem`. Supports nested children (auto-expands active parent on navigation). Import from `shared/components/sidebar/index.ts`.

```typescript
import { SidebarNavItem, SidebarUser } from '../shared/components/sidebar';

const nav: SidebarNavItem[] = [
  { label: 'แดชบอร์ด', icon: 'pi-chart-bar', route: '/dashboard/overview' },
  {
    label: 'จัดการผู้ใช้',
    icon: 'pi-users',
    children: [
      { label: 'รายชื่อ', icon: '', route: '/user-management/list' },
    ],
  },
];
```

The `badge` field on a nav item renders a numeric badge on the icon.

### `app-select-items-dialog` (`shared/components/dialogs/select-items-dialog/`)

Searchable multi-select picker dialog. Items can have an avatar, label, and sublabel. Emits the selected `string[]` on confirm.

```typescript
export interface SelectItemOption {
  value: string;
  label: string;
  avatar?: string;
  sublabel?: string;
}
```

```html
<app-select-items-dialog
  [(visible)]="showPicker"
  title="เลือกสมาชิก"
  [items]="memberOptions()"
  [selected]="selectedIds()"
  (confirmed)="onMembersSelected($event)"
/>
```

### `app-documents-dialog` (`shared/components/dialogs/documents-dialog/`)

Read-only dialog that lists project documents with file-type icons (PDF, Word, generic). Pass a `ProjectDocument[]` array.

```typescript
export interface ProjectDocument { id: string; name: string; url: string; }
```

```html
<app-documents-dialog [(visible)]="showDocs" [documents]="project().documents" />
```

## Toasts

`MessageService` (from `primeng/api`) is provided globally in `app.config.ts`. Inject it in any component or service to show toasts. The `<p-toast>` is rendered once in `app.html`.

```typescript
private messageService = inject(MessageService);

this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: '...', life: 3000 });
```
