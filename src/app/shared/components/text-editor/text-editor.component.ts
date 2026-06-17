import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Editor } from 'primeng/editor';

@Component({
  selector: 'app-text-editor',
  imports: [FormsModule, Editor],
  templateUrl: './text-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextEditorComponent {
  readonly value = model('');
  readonly placeholder = input('รายละเอียด');
  readonly minHeight = input('180px');
}
