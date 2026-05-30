# Developer Skills Reference

Skills and knowledge required to work effectively on this project.

---

## 1. Angular 21 (Signals-first)

**Must know:**
- Standalone components — no NgModules required; `standalone: true` is now the default (do not set it explicitly)
- Signals API: `signal()`, `computed()`, `effect()` for reactive state
- New control flow syntax: `@if`, `@for`, `@switch`, `@defer` — never use `*ngIf` / `*ngFor`
- `input()` / `output()` functions — never use `@Input()` / `@Output()` decorators
- `inject()` function — never use constructor injection
- `ChangeDetectionStrategy.OnPush` on every component
- `NgOptimizedImage` for all static images

**Best practice:**
```ts
// ✅ correct
const count = signal(0);
const doubled = computed(() => count() * 2);

// ❌ wrong
@Input() count = 0;
```

---

## 2. TypeScript 5.9

**Must know:**
- Strict mode enabled — no implicit `any`
- Use `unknown` over `any` when type is uncertain
- Utility types: `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`
- Discriminated unions for exhaustive type narrowing
- `satisfies` operator for type validation without widening
- Generic functions and interfaces

**Best practice:**
```ts
// ✅ correct
function fetch<T>(url: string): Promise<T> { ... }

// ❌ wrong
function fetch(url: string): Promise<any> { ... }
```

---

## 3. PrimeNG 21

**Must know:**
- Import components individually (standalone) — never import the whole `PrimeNGModule`
- Configure theme via `providePrimeNG()` in `app.config.ts` (Aura preset is already set)
- PrimeIcons class names: `pi pi-*`
- Key components to know: `p-table`, `p-dialog`, `p-button`, `p-input-text`, `p-dropdown`, `p-toast`, `p-message`, `p-card`, `p-sidebar`, `p-breadcrumb`, `p-paginator`
- Use `p-fluid` class to make form elements fill container width
- Bind `[severity]` and `[outlined]` for button variants — do not recreate variants with custom CSS

**Best practice:**
```ts
// ✅ correct — import only what you use
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

// ❌ wrong
import { PrimeNGModule } from 'primeng/primeng';
```

---

## 4. Tailwind CSS 4

**Must know:**
- Tailwind CSS 4 uses `@import "tailwindcss"` — no `tailwind.config.js` needed by default
- Use utility classes for layout, spacing, colors, and typography
- Combine with PrimeNG: use Tailwind for layout/spacing, PrimeNG for interactive components
- Use `gap-*`, `grid`, `flex`, `p-*`, `m-*` utilities — do not write custom CSS for simple layout
- Dark mode via `dark:` prefix
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

**Best practice:**
```html
<!-- ✅ correct -->
<div class="flex flex-col gap-4 p-6">

<!-- ❌ wrong -->
<div [ngStyle]="{ display: 'flex', gap: '1rem' }">
```

---

## 5. Reactive Forms

**Must know:**
- Use `FormBuilder` (injected via `inject(FormBuilder)`) to create `FormGroup` and `FormControl`
- Use built-in validators: `Validators.required`, `Validators.email`, `Validators.minLength`, etc.
- Create custom validators as pure functions returning `ValidationErrors | null`
- Bind with `[formGroup]` and `formControlName` — never use `[(ngModel)]`
- Access errors via `form.get('field')?.errors`
- Use `p-iftalabel` or `p-floatlabel` from PrimeNG for accessible form labels

**Best practice:**
```ts
readonly form = inject(FormBuilder).group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', Validators.minLength(8)],
});
```

---

## 6. Signals-based State Management

**Must know:**
- Use `signal()` + `computed()` for local and feature-level state — no NgRx needed for simple state
- For shared/global state, use a service with `signal()` fields (signal store pattern)
- Use `update()` or `set()` — never `mutate()`
- Keep side effects in `effect()` or service methods — not in templates
- State shape should be typed with explicit interfaces

**Best practice:**
```ts
@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly #user = signal<User | null>(null);
  readonly user = this.#user.asReadonly();
  readonly isAuthenticated = computed(() => this.#user() !== null);

  setUser(user: User) { this.#user.set(user); }
  clearUser() { this.#user.set(null); }
}
```

---

## 7. Routing & Lazy Loading

**Must know:**
- All feature routes MUST be lazy-loaded with `loadComponent()` or `loadChildren()`
- Use route guards (`CanActivateFn`) via `inject()` inside the function — no class-based guards
- Use route resolvers to pre-fetch data before component activates
- Use `withComponentInputBinding()` to bind route params directly to component inputs

**Best practice:**
```ts
// ✅ correct — lazy loaded
{
  path: 'tickets',
  loadChildren: () => import('./features/tickets/tickets.routes').then(m => m.TICKETS_ROUTES),
}

// Auth guard as a function
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};
```

---

## 8. HTTP & API Integration

**Must know:**
- Use `HttpClient` with `inject(HttpClient)` inside services
- Use `provideHttpClient(withInterceptors([...]))` in `app.config.ts`
- Write interceptors as functions (`HttpInterceptorFn`) — not classes
- Attach JWT token in auth interceptor
- Handle errors with `catchError` and `throwError` from RxJS
- Return typed `Observable<T>` from all service methods

**Best practice:**
```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq);
};
```

---

## 9. Testing with Vitest

**Must know:**
- Vitest is the test runner (not Karma/Jasmine) — use `describe`, `it`, `expect`, `vi`
- Use `vi.fn()` for mocks and `vi.spyOn()` for spies
- Test signals by calling them as functions: `expect(store.count()).toBe(1)`
- Prefer testing behavior over implementation details
- Test file naming: `*.spec.ts` co-located with the source file

**Best practice:**
```ts
it('should increment count', () => {
  const store = new CounterStore();
  store.increment();
  expect(store.count()).toBe(1);
});
```

---

## 10. Accessibility (WCAG AA)

**Must know:**
- Every interactive element must be keyboard-navigable and focusable
- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`
- All images need `alt` attributes; decorative images use `alt=""`
- Use `aria-label` when visible label is absent; use `aria-describedby` for hints
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Dialogs must trap focus — PrimeNG `p-dialog` handles this automatically
- Avoid `tabindex` values greater than 0

**Must NOT do:**
- `<div (click)="...">` without `role` and `tabindex="0"`
- Missing form labels (use `<label [for]>` or `aria-label`)
- Color as the only indicator (e.g., red text for error without an icon or message)

---

## 11. Code Style & Conventions

**Must know:**
- Prettier is configured — run format before committing
- File naming: `kebab-case.component.ts`, `kebab-case.service.ts`, `kebab-case.store.ts`
- One component per file; keep templates short (extract sub-components when needed)
- No `ngClass` — use `[class.foo]="condition"` or `[class]="{ foo: condition }"`
- No `ngStyle` — use `[style.property]="value"` or Tailwind classes
- No comments for obvious code — comment only non-obvious WHY, not WHAT

---

## 12. Project-specific Patterns

| Pattern | Implementation |
|---|---|
| Feature state | Signal store service in `features/<name>/store/` |
| API calls | Service in `features/<name>/services/` |
| Shared UI | Standalone components in `shared/components/` |
| Auth token | Stored in signal store, attached via HTTP interceptor |
| Notifications | PrimeNG `p-toast` via `MessageService` |
| Confirmation | PrimeNG `p-confirmdialog` via `ConfirmationService` |
| Tables | PrimeNG `p-table` with lazy loading for server-side pagination |
| Error display | PrimeNG `p-message` or inline form field errors |
