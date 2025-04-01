import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AdminProjectsLegalInfoApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { filter, finalize, map, startWith, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-authorship-form-field',
  template: `
    <mat-form-field style="width: 100%">
      <mat-label>Authorships</mat-label>
      <mat-chip-grid #chipGrid aria-label="Authorships">
        <mat-chip-row *ngFor="let authorship of selectedItems" (removed)="removeItem(authorship)">
          {{ authorship }}
          <button matChipRemove [attr.aria-label]="'remove ' + authorship">
            <mat-icon>cancel</mat-icon>
          </button>
        </mat-chip-row>
      </mat-chip-grid>
      <input
        placeholder="New authorship..."
        [formControl]="inputControl"
        [matChipInputFor]="chipGrid"
        [matAutocomplete]="auto"
        [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
        (matChipInputTokenEnd)="addItem($event)" />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectItem($event)">
        <mat-option *ngFor="let option of availableAuthorships" [value]="option">
          {{ option }}
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class AuthorshipFormFieldComponent implements OnInit {
  @Input() control!: FormControl<string[] | null>;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  inputControl = new FormControl('');
  selectedItems: string[] = [];
  availableAuthorships: string[] = [];

  loading = true;

  constructor(
    private _adminApi: AdminProjectsLegalInfoApiService,
    private _store: Store
  ) {}

  ngOnInit() {
    this._store
      .select(ProjectsSelectors.currentProject)
      .pipe(
        filter(project => project !== undefined),
        take(1),
        switchMap(project =>
          this._adminApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoAuthorships(project!.shortcode)
        ),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        this.availableAuthorships = response.data;
      });
  }

  filteredOptions = this.inputControl.valueChanges.pipe(
    startWith(''),
    map(value => this._filter(value || ''))
  );

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableAuthorships.filter(option => option.toLowerCase().includes(filterValue));
  }

  addItem(event: any) {
    const inputValue = event.value.trim();
    if (inputValue && !this.selectedItems.includes(inputValue)) {
      if (!this.availableAuthorships.includes(inputValue)) {
        this.availableAuthorships.push(inputValue); // Add new item to options
      }
      this.selectedItems.push(inputValue);
      this._updateFormControl();
    }
    event.chipInput!.clear();
    this.inputControl.setValue('');
  }

  selectItem(event: MatAutocompleteSelectedEvent) {
    const selectedValue = event.option.viewValue;
    if (!this.selectedItems.includes(selectedValue)) {
      this.selectedItems.push(selectedValue);
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
