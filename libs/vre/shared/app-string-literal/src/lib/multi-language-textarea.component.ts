import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { NgxsStoreModule } from '@dasch-swiss/vre/shared/app-state';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { HumanReadableErrorPipe } from './human-readable-error.pipe';
import { MultiLanguageFormService } from './multi-language-form.service';

@Component({
  selector: 'dasch-swiss-multi-language-textarea',
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
    NgxsStoragePluginModule,
    HumanReadableErrorPipe,
  ],
  template: `
    <div style="display: flex">
      <mat-button-toggle-group matPrefix #group="matButtonToggleGroup" vertical>
        <mat-button-toggle
          *ngFor="let lang of _myService.availableLanguages; let index = index"
          (click)="_myService.changeLanguage(index); textInput.focus()"
          [checked]="index === _myService.selectedLanguageIndex"
          [class.bold]="_myService.getFormControlWithLanguage(lang) !== undefined">
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
          [formControl]="_myService.selectedFormControl">
        </textarea>
      </mat-form-field>
    </div>
    <mat-error *ngIf="_myService.formArray.invalid && _myService.formArray.touched">
      <ng-container *ngIf="_myService.invalidErrors?.language"
        >Language {{ _myService.invalidErrors.language }}:
        {{ _myService.invalidErrors.error | humanReadableError }}</ng-container
      >
      <ng-container *ngIf="!_myService.invalidErrors?.language">{{
        _myService.invalidErrors.error | humanReadableError
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

  constructor(public _myService: MultiLanguageFormService) {}

  ngOnInit() {
    this._myService.onInit(this.formGroup, this.controlName);
  }
}
