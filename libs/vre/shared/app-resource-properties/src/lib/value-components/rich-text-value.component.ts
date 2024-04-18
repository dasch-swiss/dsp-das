import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as Editor from 'ckeditor5-custom-build';
import { ckEditor } from '../ck-editor';

@Component({
  selector: 'app-rich-text-value',
  template: `
    <ckeditor [formControl]="control" [config]="editorConfig" [editor]="editor" (change)="onChange()"></ckeditor>
  `,
})
export class RichTextValueComponent {
  @Input() control!: FormControl<string>;

  editorConfig = ckEditor.config;
  editor = Editor;
  onChange = () => {};
}
