import { Component } from '@angular/core';
// @ts-ignore
import * as Editor from 'ckeditor5-custom-build';
import { ckEditor } from '../ck-editor';

@Component({
  selector: 'app-rich-text-value',
  template: `
    <ckeditor [formControlName]="'value'" [config]="editorConfig" [editor]="editor" (change)="onChange()"></ckeditor>
  `,
})
export class RichTextValueComponent {
  editorConfig = ckEditor.config;
  editor = Editor;
  onChange = () => {};
}
