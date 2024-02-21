import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

export type MultiLanguageForm = FormArray<FormGroup<{ language: FormControl<string>; value: FormControl<string> }>>;

export type PropertyForm = FormGroup<{
  type: FormControl<string>;
  name: FormControl<string>;
  labels: MultiLanguageForm;
  comments: MultiLanguageForm;
}>;

@Component({
  selector: 'app-property-form-2',
  template: ` <form [formGroup]="form">
    <mat-form-field>
      <span matPrefix class="ontology-prefix-icon">
        <mat-icon>ICON</mat-icon>
      </span>
      <mat-label>Property type</mat-label>
      <mat-select formControlName="type">
        <mat-select-trigger> TEST</mat-select-trigger>

        <mat-optgroup *ngFor="let type of [['A'], ['B']]" label="label">
          <mat-option *ngFor="let ele of type" [value]="ele">
            <mat-icon>ICON</mat-icon>
            {{ ele }}
          </mat-option>
        </mat-optgroup>
      </mat-select>
    </mat-form-field>

    <app-common-input
      placeholder="Property name *"
      prefixIcon="fingerprint"
      [formGroup]="form"
      controlName="name"></app-common-input>
    <dasch-swiss-multi-language-input
      [formGroup]="form"
      controlName="label"
      placeholder="Property label*"></dasch-swiss-multi-language-input>
    <dasch-swiss-multi-language-textarea
      [formGroup]="form"
      controlName="comment"
      placeholder="Comment"></dasch-swiss-multi-language-textarea>
  </form>`,
})
export class PropertyForm2Component implements OnInit, OnDestroy {
  @Input() formData;
  @Output() formValueChange = new EventEmitter<FormGroup>();

  subscription: Subscription;

  ngOnInit() {
    this.subscription = this.form.valueChanges.subscribe(z => {
      this.formValueChange.emit(this.form);
    });
    this.formValueChange.emit(this.form);
  }

  form: PropertyForm = this._fb.group({
    type: null as string,
    name: null as string,
    labels: this._fb.array([
      this._fb.group({
        language: '',
        value: '',
      }),
    ]),
    comments: this._fb.array([
      this._fb.group({
        language: '',
        value: '',
      }),
    ]),
  });

  constructor(private _fb: FormBuilder) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
