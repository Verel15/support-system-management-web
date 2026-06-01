import { Directive, TemplateRef, inject, input } from '@angular/core';

@Directive({
  selector: '[dataTableCell]',
})
export class DataTableCellDirective {
  readonly dataTableCell = input.required<string>();
  readonly template: TemplateRef<unknown> = inject(TemplateRef);
}
