import { Component, Input } from '@angular/core';
import { ListsFacade } from '@dasch-swiss/vre/core/state';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { switchMap } from 'rxjs';
import { PropertyForm } from './property-form.type';

@Component({
  selector: 'app-gui-attr-list',
  template: `
    <mat-form-field class="large-field">
      <span matPrefix> <mat-icon>tune</mat-icon>&nbsp; </span>
      <mat-label>Select a list</mat-label>
      <mat-select [formControl]="control">
        <mat-option *ngFor="let list of lists$ | async" [value]="list.id">
          {{ list.labels | appStringifyStringLiteral }}
        </mat-option>
      </mat-select>
      <mat-error *ngIf="control.invalid && control.touched && control.errors as errors">
        {{ errors[0] | humanReadableError }}
      </mat-error>
    </mat-form-field>
  `,
  styles: ['.large-field {width: 100%}'],
})
export class GuiAttrListComponent {
  @Input({ required: true }) control!: PropertyForm['controls']['guiAttr'];
  lists$ = this._projectPageService.currentProject$.pipe(
    switchMap(project => this._listFacadeService.getListsInProject$(project))
  );

  constructor(
    private _projectPageService: ProjectPageService,
    private _listFacadeService: ListsFacade
  ) {}
}
