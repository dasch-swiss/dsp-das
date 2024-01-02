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
import { HumanReadableErrorPipe } from '../human-readable-error/human-readable-error.pipe';
import { AppStringLiteral2Service } from './dasch-swiss-string-literal-2.service';

@Component({
  selector: 'dasch-swiss-app-string-literal-2-input',
  standalone: true,
  providers: [AppStringLiteral2Service],
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
        <span
          [class.bold]="
            _myService.getFormControlWithLanguage(_myService.availableLanguages[_myService.selectedLanguageIndex]) !==
            undefined
          "
          >{{ _myService.availableLanguages[_myService.selectedLanguageIndex] }}</span
        >
        <mat-icon class="icon" matSuffix>keyboard_arrow_down</mat-icon>
      </button>

      <input
        matInput
        [placeholder]="placeholder"
        [formControl]="_myService.selectedFormControl"
        #textInput
        [readonly]="!editable" />
    </mat-form-field>
    <mat-error *ngIf="_myService.formArray.invalid && _myService.formArray.touched">
      <ng-container *ngIf="_myService.invalidErrors?.language"
        >Language {{ _myService.invalidErrors.language }}:
        {{ _myService.invalidErrors.error | humanReadableError }}</ng-container
      >
      <ng-container *ngIf="!_myService.invalidErrors?.language">{{
        _myService.invalidErrors.error | humanReadableError
      }}</ng-container>
    </mat-error>

    <mat-menu #selectLanguage="matMenu" class="lang-menu">
      <button
        mat-menu-item
        type="button"
        *ngFor="let lang of _myService.availableLanguages; let index = index"
        (click)="_myService.changeLanguage(index); textInput.focus()">
        <span [class.bold]="_myService.getFormControlWithLanguage(lang) !== undefined">{{ lang }}</span>
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
export class AppStringLiteral2InputComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() editable = true;
  @Input() placeholder: string;

  constructor(public _myService: AppStringLiteral2Service) {}

  ngOnInit() {
    this._myService.onInit(this.formGroup, this.controlName);
  }
}
