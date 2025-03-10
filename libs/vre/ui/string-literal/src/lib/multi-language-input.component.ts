import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { NgxsStoreModule } from '@dasch-swiss/vre/core/state';
import { HumanReadableErrorPipe } from './human-readable-error.pipe';
import { MultiLanguageFormArray } from './multi-language-form-array.type';
import { MultiLanguageFormService } from './multi-language-form.service';

@Component({
  selector: 'app-multi-language-input',
  standalone: true,
  providers: [MultiLanguageFormService],
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
    HumanReadableErrorPipe,
  ],
  template: `
    <mat-form-field style="width: 100%">
      <mat-label>{{ placeholder }}</mat-label>
      <button
        mat-button
        type="button"
        matPrefix
        tabIndex="-1"
        [matMenuTriggerFor]="selectLanguage"
        #btnToSelectLanguage="matMenuTrigger">
        <span
          [class.bold]="
            formService.getFormControlWithLanguage(
              formService.availableLanguages[formService.selectedLanguageIndex]
            ) !== undefined
          "
          >{{ formService.availableLanguages[formService.selectedLanguageIndex] }}</span
        >
        <mat-icon class="icon" matSuffix>keyboard_arrow_down</mat-icon>
      </button>

      <input
        matInput
        [placeholder]="placeholder"
        #textInput
        [required]="isRequired"
        [ngModel]="formService.inputValue"
        (ngModelChange)="formService.onInputChange($event)"
        (blur)="formService.formArray.markAsTouched()"
        [disabled]="formService.selectedFormControl?.disabled"
        [readonly]="!editable" />
    </mat-form-field>
    <mat-error *ngIf="formService.formArray.invalid && formService.formArray.touched">
      <ng-container *ngIf="formService.invalidErrors?.language"
        >Language {{ formService.invalidErrors.language }}:
        {{ formService.invalidErrors.error | humanReadableError }}
      </ng-container>
      <ng-container *ngIf="!formService.invalidErrors?.language"
        >{{ formService.invalidErrors.error | humanReadableError }}
      </ng-container>
    </mat-error>

    <mat-menu #selectLanguage="matMenu" class="lang-menu">
      <button
        mat-menu-item
        type="button"
        *ngFor="let lang of formService.availableLanguages; let index = index"
        (click)="formService.changeLanguage(index); textInput.focus()">
        <span [class.bold]="formService.getFormControlWithLanguage(lang) !== undefined">{{ lang }}</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .bold {
        font-weight: bold;
      }
    `,
  ],
})
export class MutiLanguageInputComponent implements OnInit, OnChanges {
  @Input() formArray: MultiLanguageFormArray;
  @Input() editable = true;
  @Input() placeholder: string;
  @Input() validators: ValidatorFn[];
  @Input({ required: true }) isRequired!: boolean;

  constructor(public formService: MultiLanguageFormService) {}

  ngOnInit() {
    this.initialize();
  }

  ngOnChanges() {
    this.initialize();
  }

  private initialize() {
    this.formService.onInit(this.formArray, this.validators);
  }
}
