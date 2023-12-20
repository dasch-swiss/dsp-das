import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { NgxsStoreModule, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
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
  ],
  template: `
    <mat-button-toggle-group matPrefix #group="matButtonToggleGroup" vertical>
      <mat-button-toggle
        *ngFor="let lang of availableLanguages; trackBy: trackByFn"
        (click)="selectedLanguage = lang"
        [checked]="lang === selectedLanguage">
        <span>{{ lang }}</span>
      </mat-button-toggle>
    </mat-button-toggle-group>
    <mat-form-field>
      <textarea
        matInput
        [placeholder]="placeholder"
        #textInput
        [readonly]="editable"
        [formControl]="selectedFormControl">
      </textarea>
    </mat-form-field>
  `,
})
export class AppStringLiteral2Component {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() editable = false;
  @Input() placeholder: string;

  @ViewChild('textInput', { static: false }) textInput!: ElementRef;

  selectedLanguage: string;
  availableLanguages: string[] = ['de', 'fr', 'it', 'en', 'rm'];

  get formArray() {
    return this.formGroup.controls[this.controlName] as FormArray;
  }

  get selectedFormControl() {
    return this.formArray.at(0).get('value') as FormControl;
  }

  constructor(private _store: Store) {
    this._setupUserLanguage();
  }

  ngOnInit() {
    console.log(this.selectedFormControl);
  }

  trackByFn = (index: number, item: string) => `${index}-${item}`;

  /** Backend sometimes send {values: ''} (to remove)
   * or also send {values: ''} without language property (add 'de')
   */
  private _solveBackendInconsistensies(value: StringLiteral[]) {
    value = value.filter(item => item.value.trim() !== '');

    if (value.length > 0 && value[0].language === undefined) {
      value[0].language = 'de';
    }
  }

  private _setupUserLanguage() {
    // set selected language, if it's not defined yet
    if (!this.selectedLanguage) {
      const usersLanguage = this._store.selectSnapshot(UserSelectors.language) as string;
      this.selectedLanguage = usersLanguage || navigator.language.substring(0, 2); // get default language from browser
    }

    // does the defined language exists in our supported languages list?
    if (this.availableLanguages.indexOf(this.selectedLanguage) === -1) {
      // if not, select the first language from our list of supported languages
      this.selectedLanguage = this.availableLanguages[0];
    }
  }
}
