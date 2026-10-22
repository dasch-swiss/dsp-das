import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-property-value-basic-comment',
  imports: [
    MatFormField,
    MatLabel,
    MatIcon,
    MatPrefix,
    CdkTextareaAutosize,
    MatInput,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  // Compact like the value it comments on (DEV-7611): 36px for one line, growing with the text.
  // Outlined, because a filled field hides its label at that height and "Comment" is all that tells
  // this field from the value above it; the top margin is room for that label, which rises above
  // the field's border.
  host: { class: 'compact-value-editor' },
  template: ` <mat-form-field
    appearance="outline"
    style="flex: 1; width: 100%; margin-top: 8px"
    subscriptSizing="dynamic">
    <mat-label>{{ 'resourceEditor.resourceProperties.comment' | translate }}</mat-label>
    @if (control.disabled) {
      <mat-icon matPrefix style="color: #808080">lock</mat-icon>
    }
    <textarea cdkTextareaAutosize matInput data-cy="comment-textarea" [formControl]="control"></textarea>
  </mat-form-field>`,
})
export class PropertyValueBasicCommentComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
}
