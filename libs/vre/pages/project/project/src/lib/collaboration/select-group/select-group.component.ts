import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Group } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AutocompleteItem } from '@dasch-swiss/vre/pages/user-settings/user';

@Component({
  selector: 'app-select-group',
  template: `
    <mat-form-field *ngIf="groups.length > 0">
      <mat-select placeholder="Permission group" [formControl]="groupCtrl" multiple (selectionChange)="onGroupChange()">
        <mat-option *ngFor="let group of groups; trackBy: trackByFn" [value]="group.id" [disabled]="disabled">
          {{ group.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <div *ngIf="groups.length === 0" class="center">No group defined yet.</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectGroupComponent implements AfterViewInit {
  @Input({ required: true }) projectId!: string;
  @Input({ required: true }) disabled!: boolean;
  @Input({ required: true }) permissions: any;
  @Input({ required: true }) groups!: Group[];
  @Output() groupChange = new EventEmitter<any>();

  groupCtrl = new UntypedFormControl();

  ngAfterViewInit() {
    setTimeout(() => {
      this.groupCtrl.setValue(this.permissions);
    });
  }

  trackByFn = (index: number, item: AutocompleteItem) => `${index}-${item.label}`;

  onGroupChange() {
    if (!this.groupCtrl.value) {
      return;
    }

    if (this._sort(this.permissions, this.groupCtrl.value)) {
      this.permissions = this.groupCtrl.value;
      this.groupChange.emit(this.groupCtrl.value);
    }
  }

  private _sort(arrOne: string[], arrTwo: string[]): boolean {
    return [...arrOne].sort().join(',') !== [...arrTwo].sort().join(',');
  }
}
