import { AsyncPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptgroup, MatOption } from '@angular/material/core';
import { MatFormField, MatPrefix, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { LocalizationService, SortingHelper } from '@dasch-swiss/vre/shared/app-helper-services';
import { HumanReadableErrorPipe, StringifyStringLiteralPipe } from '@dasch-swiss/vre/ui/string-literal';
import { combineLatest, map } from 'rxjs';
import { PropertyForm } from './property-form.type';

export interface ClassToSelect {
  ontologyId: string;
  ontologyLabel: string;
  classes: ResourceClassDefinitionWithAllLanguages[];
}

@Component({
  selector: 'app-gui-attr-link',
  template: `
    <mat-form-field>
      <span matPrefix> <mat-icon>tune</mat-icon>&nbsp; </span>
      <mat-label>Select resource class</mat-label>
      <mat-select [formControl]="control">
        @for (onto of ontologyClasses$ | async; track onto) {
          <mat-optgroup [label]="onto.ontologyLabel">
            @for (oClass of onto.classes; track oClass) {
              <mat-option [value]="oClass.id"> {{ oClass.labels | appStringifyStringLiteral }}</mat-option>
            }
          </mat-optgroup>
        }
      </mat-select>
      @if (control.invalid && control.touched && control.errors![0]; as error) {
        <mat-error>
          {{ error | humanReadableError }}
        </mat-error>
      }
    </mat-form-field>
  `,
  styles: ['mat-form-field {width: 100%}'],
  standalone: true,
  imports: [
    MatFormField,
    MatPrefix,
    MatIcon,
    MatLabel,
    MatSelect,
    FormsModule,
    ReactiveFormsModule,
    MatOptgroup,
    MatOption,
    MatError,
    HumanReadableErrorPipe,
    AsyncPipe,
    StringifyStringLiteralPipe,
  ],
})
export class GuiAttrLinkComponent {
  @Input({ required: true }) control!: PropertyForm['controls']['guiAttr'];

  ontologyClasses$ = combineLatest([
    this._projectPageService.ontologies$,
    this._localizationService.currentLanguage$,
  ]).pipe(
    map(([response, lang]) => {
      const ontologyClasses = [] as ClassToSelect[];
      response.forEach(onto => {
        const classes = onto.getClassDefinitionsByType(ResourceClassDefinitionWithAllLanguages);
        const classDefs = SortingHelper.sortByLabelsAlphabetically(classes, 'label', lang);
        if (classDefs.length) {
          ontologyClasses.push({
            ontologyId: onto.id,
            ontologyLabel: onto.label,
            classes: classDefs,
          } as ClassToSelect);
        }
      });
      return ontologyClasses;
    })
  );

  constructor(
    private _projectPageService: ProjectPageService,
    private _localizationService: LocalizationService
  ) {}
}
