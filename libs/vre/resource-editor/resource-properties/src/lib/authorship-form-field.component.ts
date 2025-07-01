import { ENTER, TAB } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInput, MatChipInputEvent } from '@angular/material/chips';
import { finalize } from 'rxjs/operators';
import { PaginatedApiService } from './paginated-api.service';

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
        #test
        [matChipInputFor]="chipGrid"
        [matAutocomplete]="auto"
        [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
        (matChipInputTokenEnd)="addItemFromMaterial($event)" />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectItem($event)">
        <mat-option *ngFor="let option of filteredAuthorship" [value]="option">
          {{ option }}
        </mat-option>

        <mat-option *ngIf="AIContentMissing">{{ AIAuthorship }}</mat-option>

        <mat-option *ngIf="publicDomainMissing">{{ publicDomainAuthorship }}</mat-option>
      </mat-autocomplete>
      <mat-hint>Press Enter or Tab to add an item.</mat-hint>

      <mat-error *ngIf="control.invalid && control.touched && control.errors![0] as error">
        {{ error | humanReadableError }}
      </mat-error>
    </mat-form-field>
  `,
})
export class AuthorshipFormFieldComponent implements OnInit {
  @Input() control!: FormControl<string[] | null>;
  @Input({ required: true }) projectShortcode!: string;
  @ViewChild(MatChipInput, { static: true }) chipInput!: MatChipInput;

  readonly separatorKeysCodes: number[] = [ENTER, TAB];
  selectedItems: string[] = [];
  availableAuthorship: string[] = [];
  filteredAuthorship: string[] = [];
  loading = true;

  readonly AIAuthorship = 'AI-Generated Content – Not Protected by Copyright';
  readonly publicDomainAuthorship = 'Public Domain – Not Protected by Copyright';

  get AIContentMissing() {
    return !this.availableAuthorship.includes(this.AIAuthorship);
  }

  get publicDomainMissing() {
    return !this.availableAuthorship.includes(this.publicDomainAuthorship);
  }

  constructor(
    private _paginatedApi: PaginatedApiService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._paginatedApi
      .getAuthorships(this.projectShortcode)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        this.availableAuthorship = response;
      });
  }

  addItemFromMaterial(event: MatChipInputEvent) {
    this._addItem(event.value.trim());
  }

  selectItem(event: MatAutocompleteSelectedEvent) {
    const selectedValue = event.option.viewValue;
    if (!this.selectedItems.includes(selectedValue)) {
      this.selectedItems.push(selectedValue);
      this._updateFormControl();
    }
    this.chipInput.clear();
  }

  removeItem(item: string) {
    this.selectedItems = this.selectedItems.filter(i => i !== item);
    this._updateFormControl();
  }

  private _addItem(authorship: string) {
    this.chipInput.clear();

    if (authorship === '' || this.selectedItems.includes(authorship)) {
      return;
    }

    if (!this.availableAuthorship.includes(authorship)) {
      this.availableAuthorship.push(authorship);
    }

    this.selectedItems.push(authorship);
    this._updateFormControl();
    this._cdr.detectChanges();
  }

  private _updateFormControl() {
    this.control.setValue(this.selectedItems);
  }
}
