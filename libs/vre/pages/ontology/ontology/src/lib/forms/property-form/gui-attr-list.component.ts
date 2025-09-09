import { AsyncPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatPrefix, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { ListApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { HumanReadableErrorPipe, StringifyStringLiteralPipe } from '@dasch-swiss/vre/ui/string-literal';
import { map, switchMap } from 'rxjs';
import { PropertyForm } from './property-form.type';

@Component({
  selector: 'app-gui-attr-list',
  template: `
    <mat-form-field class="large-field">
      <span matPrefix> <mat-icon>tune</mat-icon>&nbsp; </span>
      <mat-label>Select a list</mat-label>
      <mat-select [formControl]="control">
        @for (list of lists$ | async; track list) {
          <mat-option [value]="list.id">
            {{ list.labels | appStringifyStringLiteral }}
          </mat-option>
        }
      </mat-select>
      @if (control.invalid && control.touched && control.errors; as errors) {
        <mat-error>
          {{ errors[0] | humanReadableError }}
        </mat-error>
      }
    </mat-form-field>
  `,
  styles: ['.large-field {width: 100%}'],
  standalone: true,
  imports: [
    MatFormField,
    MatPrefix,
    MatIcon,
    MatLabel,
    MatSelect,
    FormsModule,
    ReactiveFormsModule,
    MatOption,
    MatError,
    HumanReadableErrorPipe,
    AsyncPipe,
    StringifyStringLiteralPipe,
  ],
})
export class GuiAttrListComponent {
  @Input({ required: true }) control!: PropertyForm['controls']['guiAttr'];
  lists$ = this._projectPageService.currentProject$.pipe(
    switchMap(project => this._listApiService.listInProject(project.id)),
    map(response => response.lists)
  );

  constructor(
    private _projectPageService: ProjectPageService,
    private _listApiService: ListApiService
  ) {}
}
