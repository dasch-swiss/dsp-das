import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { NgxsStoreModule, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { HumanReadableErrorPipe } from '@dsp-app/src/app/project/human-readable-error/human-readable-error.pipe';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { Store } from '@ngxs/store';

@Component({
  selector: 'dasch-swiss-app-string-literal-2-input',
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
    <mat-form-field style="width: 100%">
      <button
        mat-button
        type="button"
        matPrefix
        [matMenuTriggerFor]="selectLanguage"
        #btnToSelectLanguage="matMenuTrigger">
        <span [class.bold]="getFormControlWithLanguage(availableLanguages[selectedLanguageIndex]) !== undefined">{{
          availableLanguages[selectedLanguageIndex]
        }}</span>
        <mat-icon class="icon" matSuffix>keyboard_arrow_down</mat-icon>
      </button>

      <input
        matInput
        [placeholder]="placeholder"
        [formControl]="selectedFormControl"
        #textInput
        [readonly]="!editable" />
    </mat-form-field>
    <mat-error *ngIf="formArray.invalid && formArray.touched">
      <ng-container *ngIf="invalidErrors?.language"
        >Language {{ invalidErrors.language }}: {{ invalidErrors.error | humanReadableError }}</ng-container
      >
      <ng-container *ngIf="!invalidErrors?.language">{{ invalidErrors.error | humanReadableError }}</ng-container>
    </mat-error>

    <mat-menu #selectLanguage="matMenu" class="lang-menu">
      <button
        mat-menu-item
        type="button"
        *ngFor="let lang of availableLanguages; let index = index"
        (click)="changeLanguage(index)">
        <span [class.bold]="getFormControlWithLanguage(lang) !== undefined">{{ lang }}</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: block;
        padding-bottom: 22px;
      }

      .bold {
        font-weight: bold;
      }
    `,
  ],
})
export class AppStringLiteral2InputComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() editable = true;
  @Input() placeholder: string;

  @ViewChild('textInput', { static: false }) textInput!: ElementRef;

  selectedLanguageIndex: number;
  availableLanguages: string[] = ['de', 'fr', 'it', 'en', 'rm'];

  get formArray() {
    console.log(this.formGroup);
    return this.formGroup.controls[this.controlName] as FormArray;
  }

  get selectedFormControl() {
    return (
      this.formArray.controls.find(
        control => control.value.language === this.availableLanguages[this.selectedLanguageIndex]
      ) as FormControl
    ).get('value') as FormControl;
  }

  get invalidErrors() {
    for (const control of this.formArray.controls) {
      if (control.get('value')?.errors) {
        return { language: control.value.language, error: control.get('value')?.errors };
      }
    }
    if (this.formArray.errors) {
      return { error: this.formArray.errors };
    }
    return undefined;
  }

  constructor(
    private _store: Store,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.selectedLanguageIndex = this._setupLanguageIndex();
  }

  getFormControlWithLanguage(lang: string) {
    return this.formArray.controls.find(control => control.value.language === lang && control.value.value !== '');
  }

  changeLanguage(languageIndex: number) {
    const language = this.availableLanguages[languageIndex];
    const languageFoundIndex = this.formArray.value.findIndex(array => array.language === language);

    if (languageFoundIndex === -1) {
      this.formArray.push(
        this._fb.group({
          language,
          value: ['', (this.formArray.controls[0].get('value') as FormControl).validator],
        })
      );
      this.changeLanguage(languageIndex);
    } else {
      this.selectedLanguageIndex = languageIndex;
      this.textInput.nativeElement.focus();
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
