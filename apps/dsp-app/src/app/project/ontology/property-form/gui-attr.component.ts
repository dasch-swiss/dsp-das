import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Constants, ReadOntology } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-api';
import { PropertyInfoObject, SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import { ListsSelectors, OntologiesSelectors } from '@dasch-swiss/vre/shared/app-state';
import { PropertyForm } from '@dsp-app/src/app/project/ontology/property-form/property-form-2.component';
import { ClassToSelect } from '@dsp-app/src/app/project/ontology/property-form/property-form.component';
import { Store } from '@ngxs/store';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-gui-attr',
  template: `<div [ngSwitch]="propertyInfo.propType.objectType">
    <!-- list property -->
    <mat-form-field class="large-field" *ngSwitchCase="dspConstants.ListValue">
      <span matPrefix class="ontology-prefix-icon">
        <mat-icon>{{ guiAttrIcon }}</mat-icon
        >&nbsp;
      </span>
      <mat-label>Select list</mat-label>
      <mat-select [formControl]="control">
        <mat-option *ngFor="let item of lists$ | async" [value]="item.id"> {{ item.labels[0].value }} </mat-option>
      </mat-select>
      <mat-error *ngIf="control.invalid && control.touched"> {{ control.errors[0] | humanReadableError }}</mat-error>
    </mat-form-field>

    <!-- link property -->
    <mat-form-field class="large-field" *ngSwitchCase="dspConstants.LinkValue">
      <span matPrefix class="ontology-prefix-icon">
        <mat-icon>{{ guiAttrIcon }}</mat-icon
        >&nbsp;
      </span>
      <mat-label>Select resource class</mat-label>
      <mat-select [formControl]="control">
        <mat-optgroup *ngFor="let onto of ontologyClasses$ | async" [label]="onto.ontologyLabel">
          <mat-option *ngFor="let oClass of onto.classes" [value]="oClass.id"> {{ oClass.label }} </mat-option>
        </mat-optgroup>
      </mat-select>
      <mat-error *ngIf="control.invalid && control.touched"> {{ control.errors[0] | humanReadableError }}</mat-error>
    </mat-form-field>

    <!-- the gui-attribute for integer and decimal are not yet supported in the app -->
    <mat-form-field class="large-field" *ngSwitchCase="[dspConstants.IntValue, dspConstants.DecimalValue]">
      <span matPrefix class="ontology-prefix-icon">
        <mat-icon>{{ guiAttrIcon }}</mat-icon
        >&nbsp;
      </span>
      <mat-label>Define range</mat-label>
      <input matInput placeholder="min" />
      <input matInput placeholder="max" />
    </mat-form-field>
    <mat-error *ngIf="control.invalid && control.touched"> {{ control.errors[0] | humanReadableError }}</mat-error>
  </div>`,
  styles: ['.large-field {width: 100%}'],
})
export class GuiAttrComponent {
  @Input() propertyInfo: PropertyInfoObject;
  @Input() control: PropertyForm['controls']['guiAttr'];
  lists$ = this._store.select(ListsSelectors.listsInProject).pipe(tap(v => console.log(v[1].id, this.control.value)));
  readonly guiAttrIcon = 'tune';
  ontologyClasses$ = this._store.select(OntologiesSelectors.currentProjectOntologies).pipe(
    map((response: ReadOntology[]) => {
      // reset list of ontology classes
      const ontologyClasses = [] as ClassToSelect[];
      response.forEach(onto => {
        const classDef = this._sortingService.keySortByAlphabetical(
          getAllEntityDefinitionsAsArray(onto.classes),
          'label'
        );
        if (classDef.length) {
          const ontoClasses: ClassToSelect = {
            ontologyId: onto.id,
            ontologyLabel: onto.label,
            classes: classDef,
          };
          ontologyClasses.push(ontoClasses);
        }
      });
      return ontologyClasses;
    })
  );

  readonly formErrors = { guiAttr: false }; // TODO change, see implementation in property form

  constructor(
    private _store: Store,
    private _sortingService: SortingService
  ) {}

  protected readonly dspConstants = Constants;
}
