import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TranslateModule } from '@ngx-translate/core';
import * as Editor from 'ckeditor5-custom-build';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { HumanReadableErrorPipe } from '../human-readable-error.pipe';
import { ckEditor } from './ck-editor';
import { crossProjectLinkValidator } from './cross-project-link.validator';
import { unescapeHtml } from './unescape-html';

@Component({
  selector: 'app-ck-editor',
  styleUrl: './ck-editor.component.scss',
  template: ` <ckeditor
      [formControl]="footnoteControl"
      [config]="ckEditor.config"
      [editor]="editor"
      style="margin-bottom: 22px; display: block;" />
    @if (control.touched && control.errors; as errors) {
      <mat-error>{{ errors | humanReadableError | translate }}</mat-error>
    }`,
  imports: [CKEditorModule, HumanReadableErrorPipe, MatFormFieldModule, ReactiveFormsModule, TranslateModule],
  standalone: true,
})
export class CkEditorComponent implements OnInit, OnDestroy {
  @Input({ required: true }) control!: FormControl<string | null>;
  @Input() projectShortcode?: string | null;
  footnoteControl = new FormControl('');

  readonly editor = Editor;
  protected readonly ckEditor = ckEditor;

  private readonly _destroy$ = new Subject<void>();

  ngOnInit() {
    if (this.projectShortcode) {
      this.control.addValidators(crossProjectLinkValidator(this.projectShortcode));
      this.control.updateValueAndValidity();
    }
    let updating = false;

    this.control.valueChanges
      .pipe(startWith(this.control.value), takeUntil(this._destroy$))
      .subscribe(change => {
        if (updating) {
          return;
        }
        updating = true;
        this.footnoteControl.patchValue(change === null ? null : this._parseToFootnote(change));
        updating = false;
      });

    this.footnoteControl.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(value => {
      if (updating) {
        return;
      }
      updating = true;
      this.control.patchValue(value ? this._parseFromFootnote(value) : '');
      updating = false;
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();

    // Remove the validator that was added in ngOnInit
    if (this.projectShortcode) {
      this.control.removeValidators(crossProjectLinkValidator(this.projectShortcode));
      this.control.updateValueAndValidity();
    }
  }

  private _parseToFootnote(rawHtml: string) {
    const _footnoteRegExp2 = /<footnote content="([^>]+)"\/>/g;
    return rawHtml.replace(_footnoteRegExp2, (match, content) => {
      return `<footnote content="${content}">[Footnote]</footnote>`;
    });
  }

  private _parseFromFootnote(rawHtml: string) {
    const _footnoteRegExp = /<footnote content="([^>]+)">((?:(?!<\/footnote>).)*)<\/footnote>/g;
    return rawHtml.replace(_footnoteRegExp, (match, content) => {
      const escapedContent = unescapeHtml(content);
      return `<footnote content="${escapedContent}"></footnote>`;
    });
  }
}
