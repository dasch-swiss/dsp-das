import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { CardinalityChangeDialogComponent, CardinalityInfo } from './cardinality-change-dialog.component';

@Component({
  selector: 'app-cardinality',
  styles: [
    `
      .cardinality-checkbox {
        gap: 0.5rem;
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      input[type='checkbox'] {
        cursor: pointer;
        accent-color: var(--primary);
      }
      label {
        font-size: 0.75rem;
      }
    `,
  ],
  template: `
    <div class="cardinality-checkbox">
      <input type="checkbox" [disabled]="disabled" [(ngModel)]="multipleToggleState" (change)="onToggleChange()" />
      <label>Multiple values</label>
    </div>
    <div class="cardinality-checkbox">
      <input type="checkbox" [disabled]="disabled" [(ngModel)]="requiredToggleState" (change)="onToggleChange()" />
      <label>Required</label>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardinalityComponent implements OnInit {
  @Input() propertyInfo!: PropertyInfoObject;
  @Input() classIri!: string;
  @Input() cardinality!: Cardinality;
  @Input() disabled = false;
  @Output() cardinalityChange = new EventEmitter<Cardinality>();

  multipleToggleState = false;
  requiredToggleState = false;

  private _dialogRef: MatDialogRef<CardinalityChangeDialogComponent> | undefined;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this._initToggleStates();
  }

  private _initToggleStates() {
    this.multipleToggleState = this.cardinality === Cardinality._0_n || this.cardinality === Cardinality._1_n;
    this.requiredToggleState = this.cardinality === Cardinality._1 || this.cardinality === Cardinality._1_n;
    this._cdr.detectChanges();
  }

  private _determineTargetCardinality(): Cardinality {
    if (this.multipleToggleState) {
      return this.requiredToggleState ? Cardinality._1_n : Cardinality._0_n;
    } else {
      return this.requiredToggleState ? Cardinality._1 : Cardinality._0_1;
    }
  }

  onToggleChange() {
    const targetCardinality: Cardinality = this._determineTargetCardinality();
    const cardinalityInfo: CardinalityInfo = {
      classIri: this.classIri,
      propertyInfo: this.propertyInfo,
      currentCardinality: this.cardinality,
      targetCardinality,
    };
    const dialogConfig: MatDialogConfig = {
      data: cardinalityInfo,
      autoFocus: false,
      minWidth: '800px',
      minHeight: '200px',
    };

    this._dialogRef = this._dialog.open(CardinalityChangeDialogComponent, dialogConfig);

    this._dialogRef.afterClosed().subscribe((performChange: boolean) => {
      if (performChange) {
        this.cardinality = targetCardinality;
        this.cardinalityChange.emit(targetCardinality);
      } else {
        this._initToggleStates();
      }
    });
  }
}
