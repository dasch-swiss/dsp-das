import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { NgxsStoreModule, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { HumanReadableErrorPipe } from '@dsp-app/src/app/project/human-readable-error/human-readable-error.pipe';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { Store } from '@ngxs/store';

@Component({
  selector: 'dasch-swiss-app-string-literal-2',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    NgxsStoreModule,
    NgxsStoragePluginModule,
    HumanReadableErrorPipe,
  ],
  template: `
    <mat-button-toggle-group matPrefix #group="matButtonToggleGroup" vertical>
      <mat-button-toggle
        *ngFor="let lang of availableLanguages; let index = index; trackBy: trackByFn"
        (click)="change(index)"
        [checked]="index === selectedLanguageIndex">
        <span>{{ lang }}</span>
      </mat-button-toggle>
    </mat-button-toggle-group>
    <mat-form-field style="flex: 1">
      <textarea
        matInput
        [placeholder]="placeholder"
        #textInput
        [readonly]="editable"
        [formControl]="selectedFormControl">
      </textarea>
      <mat-error *ngIf="selectedFormControl.errors as errors">
        {{ errors | humanReadableError }}
      </mat-error>
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: flex;
      }
    `,
  ],
})
export class AppStringLiteral2Component {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() editable = false;
  @Input() placeholder: string;

  @ViewChild('textInput', { static: false }) textInput!: ElementRef;

  selectedLanguageIndex: number;
  availableLanguages: string[] = ['de', 'fr', 'it', 'en', 'rm'];

  get formArray() {
    return this.formGroup.controls[this.controlName] as FormArray;
  }

  get selectedFormControl() {
    return (
      this.formArray.controls.find(
        control => control.value.language === this.availableLanguages[this.selectedLanguageIndex]
      ) as FormControl
    ).get('value') as FormControl;
  }

  constructor(
    private _store: Store,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.selectedLanguageIndex = this._setupLanguageIndex();
  }

  trackByFn = (index: number, item: string) => `${index}-${item}`;

  change(languageIndex: number) {
    const language = this.availableLanguages[languageIndex];
    const languageFoundIndex = this.formArray.value.findIndex(array => array.language === language);
    if (languageFoundIndex === -1) {
      this.formArray.push(this._fb.group({ language, value: '' }));
      this.change(languageIndex);
    } else {
      this.selectedLanguageIndex = languageIndex;
    }
  }
  /** Backend sometimes send {values: ''} (to remove)
   * or also send {values: ''} without language property (add 'de')
   */
  private _solveBackendInconsistensies(value: StringLiteral[]) {
    value = value.filter(item => item.value.trim() !== '');

    if (value.length === 1 && !value[0].language) {
      value[0].language = this.availableLanguages[0];
    }
  }

  private _setupLanguageIndex(): number {
    const commonEntries = (this.formArray.value as { language: string }[])
      .map(v => v.language)
      .filter((itemA: string) => this.availableLanguages.includes(itemA));

    if (commonEntries.length === 0) {
      this.formArray.push(this._fb.group({ language: this.availableLanguages[0], value: '' }));
      return 0;
    }

    const userLanguage =
      (this._store.selectSnapshot(UserSelectors.language) as string) || navigator.language.substring(0, 2);

    if (commonEntries.includes(userLanguage)) {
      return this.availableLanguages.indexOf(userLanguage);
    } else {
      return this.availableLanguages.indexOf(commonEntries[0]);
    }
  }
}