import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as Editor from 'ckeditor5-custom-build/build/ckeditor';

@Component({
  selector: 'app-ck-editor',
  template: ` <ckeditor [formControl]="control" [config]="editor.defaultConfig" [editor]="editor" />
    <mat-error *ngIf="control.touched && control.errors as errors">{{ errors | humanReadableError }}</mat-error>`,
})
export class CkEditorComponent {
  @Input({ required: true }) control!: FormControl<string>;

  readonly editor = Editor;
}
