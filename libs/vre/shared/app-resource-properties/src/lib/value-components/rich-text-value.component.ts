import { Component } from '@angular/core';

@Component({
  selector: 'app-rich-text-value',
  template: `
    <ckeditor [formControlName]="'value'" [config]="editorConfig" [editor]="editor" (change)="onChange()"></ckeditor>
  `,
})
export class RichTextValueComponent {}
