import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as Editor from 'ckeditor5-custom-build/build/ckeditor';
import { ckEditor } from './ck-editor';

@Component({
  selector: 'app-ck-editor',
  template: ` <ckeditor [formControl]="footnoteControl" [config]="ckEditor.config" [editor]="editor" />
    <mat-error *ngIf="control.touched && control.errors as errors">{{ errors | humanReadableError }}</mat-error>`,
})
export class CkEditorComponent implements OnInit {
  @Input({ required: true }) control!: FormControl<string>;
  footnoteControl = new FormControl<string>('');
  readonly editor = Editor;
  protected readonly ckEditor = ckEditor;

  ngOnInit() {
    this.footnoteControl.setValue(this.control.value ? this.reverse(this.control.value) : null);
    this.footnoteControl.valueChanges.subscribe(value => {
      this.control.setValue(this.test(value));
    });
  }

  reverse(rawHtml: string) {
    const _footnoteRegExp2 = /<footnote content="([^>]+)"\/>/g;
    return rawHtml.replace(_footnoteRegExp2, (match, content) => {
      return `<footnote content="${content}">[Footnote]</footnote>`;
    });
  }

  test(rawHtml: string) {
    const _footnoteRegExp = /<footnote content="([^>]+)">([^<]*)<\/footnote>/g;
    return rawHtml.replace(_footnoteRegExp, (match, content) => {
      const escapedContent = this._unescapeHtml(content);
      return `<footnote content="${escapedContent}"></footnote>`;
    });
  }

  private _unescapeHtml(str: string) {
    const unescapeMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
    };
    return str.replace(/&(amp|lt|gt|quot|#039);/g, match => unescapeMap[match]);
  }
}
