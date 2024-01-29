import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { NgxsStoreModule } from '@dasch-swiss/vre/shared/app-state';
import { HumanReadableErrorPipe } from './human-readable-error.pipe';
import { MultiLanguageForm2Service } from './multi-language-form2.service';

@Component({
  selector: 'dasch-swiss-multi-language-textarea',
  standalone: true,
  providers: [MultiLanguageForm2Service],
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
    <div style="display: flex">
      <mat-button-toggle-group matPrefix #group="matButtonToggleGroup" vertical>
        <mat-button-toggle
          *ngFor="let lang of formService.availableLanguages; let index = index"
          (click)="formService.changeLanguage(index); textInput.focus()"
          [checked]="index === formService.selectedLanguageIndex"
          [class.bold]="formService.getFormControlWithLanguage(lang) !== undefined">
          <span>{{ lang }}</span>
        </mat-button-toggle>
      </mat-button-toggle-group>
      <mat-form-field style="flex: 1" subscriptSizing="dynamic" class="formfield">
        <textarea
          matInput
          rows="9"
          [placeholder]="placeholder"
          #textInput
          [readonly]="!editable"
          [(ngModel)]="textAreaValue"
          (ngModelChange)="onTextAreaChange($event)"></textarea>
      </mat-form-field>
    </div>
    <mat-error *ngIf="formService.formArray.invalid && formService.formArray.touched">
      <ng-container *ngIf="formService.invalidErrors?.language"
        >Language {{ formService.invalidErrors.language }}:
        {{ formService.invalidErrors.error | humanReadableError }}</ng-container
      >
      <ng-container *ngIf="!formService.invalidErrors?.language">{{
        formService.invalidErrors.error | humanReadableError
      }}</ng-container>
    </mat-error>
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
export class MultiLanguageTextareaComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() editable = true;
  @Input() placeholder: string;

  textAreaValue = '';
  onTextAreaChange(event: any) {
    console.log(event);
  }

  constructor(public formService: MultiLanguageForm2Service) {}

  ngOnInit() {
    this.formService.onInit(this.formGroup, this.controlName);
  }
}
