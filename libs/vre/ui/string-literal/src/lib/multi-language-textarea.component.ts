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
  selector: 'app-multi-language-textarea',
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
    <div style="display: flex; flex-direction: row-reverse">
      <mat-form-field style="flex: 1" subscriptSizing="dynamic" class="formfield">
        <mat-label>{{ placeholder }}</mat-label>
        <textarea
          matInput
          rows="9"
          #textInput
          [readonly]="!editable"
          [required]="isRequired"
          [ngModel]="formService.inputValue"
          (blur)="formService.formArray.markAsTouched()"
          (ngModelChange)="formService.onInputChange($event)"
          [disabled]="formService.selectedFormControl?.disabled ?? false"></textarea>
      </mat-form-field>
      <mat-button-toggle-group matPrefix #group="matButtonToggleGroup" vertical>
        <mat-button-toggle
          *ngFor="let lang of formService.availableLanguages; let index = index"
          tabIndex="-1"
          (click)="formService.changeLanguage(index); textInput.focus()"
          [checked]="index === formService.selectedLanguageIndex"
          [class.bold]="formService.getFormControlWithLanguage(lang) !== undefined">
          <span>{{ lang }}</span>
        </mat-button-toggle>
      </mat-button-toggle-group>
    </div>
    <div class="mat-mdc-form-field-subscript-wrapper mat-mdc-form-field-bottom-align ng-tns-c1205077789-8">
      <mat-error *ngIf="formService.formArray.invalid && formService.formArray.touched">
        <ng-container *ngIf="formService.invalidErrors?.language"
          >Language {{ formService.invalidErrors.language }}:
          {{ formService.invalidErrors.error | humanReadableError }}
        </ng-container>
        <ng-container *ngIf="!formService.invalidErrors?.language"
          >{{ formService.invalidErrors.error | humanReadableError }}
        </ng-container>
      </mat-error>
    </div>
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
export class MultiLanguageTextareaComponent implements OnInit, OnChanges {
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
