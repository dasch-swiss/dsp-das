import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-chip-list-input',
  template: ` <mat-form-field style="width: 100%">
    <mat-chip-grid #chipList>
      <mat-chip-row *ngFor="let tag of keywords; trackBy: trackByFn" (removed)="removeKeyword(tag)">
        {{ tag }}
        <mat-icon matChipRemove *ngIf="editable">cancel </mat-icon>
      </mat-chip-row>
      <input
        [placeholder]="('appLabels.form.project.general.keywords' | translate) + (chipsRequired ? '' : '*')"
        [matChipInputFor]="chipList"
        [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
        [matChipInputAddOnBlur]
        (matChipInputTokenEnd)="addKeyword($event)" />
    </mat-chip-grid>
  </mat-form-field>`,
})
export class ChipListInputComponent {
  @Input() keywords: string[];
  @Input() editable: boolean;
  @Input() chipsRequired: boolean;
  @Output() updatedKeywords = new EventEmitter<string[]>();

  separatorKeyCodes = [ENTER, COMMA];

  update() {
    this.updatedKeywords.emit(this.keywords);
  }

  addKeyword(event: MatChipInputEvent): void {
    const input = event.chipInput.inputElement;
    const value = event.value;

    if (!this.keywords) {
      this.keywords = [];
    }

    // add keyword
    if ((value || '').trim()) {
      this.keywords.push(value.trim());
    }

    // reset the input value
    if (input) {
      input.value = '';
    }

    this.update();
  }

  removeKeyword(keyword: any): void {
    const index = this.keywords.indexOf(keyword);

    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
    this.update();
  }

  trackByFn = (index: number, item: string) => `${index}-${item}`;
}
