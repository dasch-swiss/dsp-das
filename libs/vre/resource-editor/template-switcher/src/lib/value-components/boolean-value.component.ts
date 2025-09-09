import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { HumanReadableErrorPipe } from '@dasch-swiss/vre/ui/string-literal';
import { NullableEditorComponent } from '../nullable-editor.component';

@Component({
  selector: 'app-boolean-value',
  template: `
    <app-nullable-editor [formControl]="control" [defaultValue]="false">
      @if (control.value !== null) {
        <mat-slide-toggle [formControl]="control" data-cy="bool-toggle" style="padding: 16px" />
      }
    </app-nullable-editor>
    @if (control.touched && control.errors; as errors) {
      <mat-error>
        {{ errors | humanReadableError }}
      </mat-error>
    }
  `,
  standalone: true,
  imports: [
    NullableEditorComponent,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggle,
    MatError,
    HumanReadableErrorPipe,
  ],
})
export class BooleanValueComponent {
  @Input({ required: true }) control!: FormControl<boolean | null>;
}
