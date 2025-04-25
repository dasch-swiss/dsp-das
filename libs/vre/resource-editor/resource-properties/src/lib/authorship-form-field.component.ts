import { ENTER, TAB } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { AdminProjectsLegalInfoApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { finalize, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-authorship-form-field',
  template: `
    <mat-form-field style="width: 100%">
      <mat-label>Authorship</mat-label>
      <mat-chip-grid #chipGrid aria-label="Authorship">
        <mat-chip-row *ngFor="let authorship of selectedItems" (removed)="removeItem(authorship)">
          {{ authorship }}
          <button matChipRemove [attr.aria-label]="'remove ' + authorship">
            <mat-icon>cancel</mat-icon>
          </button>
        </mat-chip-row>
      </mat-chip-grid>
      <input
        placeholder="New authorship..."
        data-cy="authorship-chips"
        [formControl]="inputControl"
        [matChipInputFor]="chipGrid"
        [matAutocomplete]="auto"
        [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
        (matChipInputTokenEnd)="addItem($event)" />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectItem($event)">
        <mat-option *ngFor="let option of availableAuthorship" [value]="option">
          {{ option }}
        </mat-option>
      </mat-autocomplete>

      <mat-error *ngIf="control.invalid && control.touched && control.errors![0] as error">
        {{ error | humanReadableError }}
      </mat-error>
    </mat-form-field>
  `,
})
export class AuthorshipFormFieldComponent implements OnInit {
  @Input() control!: FormControl<string[] | null>;

  separatorKeysCodes: number[] = [ENTER, TAB];
  inputControl = new FormControl('');
  selectedItems: string[] = [];
  availableAuthorship: string[] = [];

  loading = true;

  constructor(
    private _adminApi: AdminProjectsLegalInfoApiService,
    private resourceFetcherService: ResourceFetcherService
  ) {}

  ngOnInit() {
    this.resourceFetcherService.projectShortcode$
      .pipe(
        switchMap(projectShortcode =>
          this._adminApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoAuthorships(projectShortcode)
        ),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        this.availableAuthorship = response.data;
      });
  }

  addItem(event: MatChipInputEvent) {
    const inputValue = event.value.trim();
    if (inputValue && !this.selectedItems.includes(inputValue)) {
      if (!this.availableAuthorship.includes(inputValue)) {
        this.availableAuthorship.push(inputValue); // Add new item to options
      }
      this.selectedItems.push(inputValue);
      this._updateFormControl();
    }
    event.chipInput.clear();
    this.inputControl.setValue('');
  }

  selectItem(event: MatAutocompleteSelectedEvent) {
    const selectedValue = event.option.viewValue;
    if (!this.selectedItems.includes(selectedValue)) {
      this.selectedItems.push(selectedValue);
      this._updateFormControl();
    }
    this.inputControl.setValue('');
  }

  removeItem(item: string) {
    this.selectedItems = this.selectedItems.filter(i => i !== item);
  }

  private _updateFormControl() {
    this.control.setValue(this.selectedItems);
  }
}
