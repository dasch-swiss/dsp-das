import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ClassDefinition,
  DeleteOntologyResponse,
  ResourceClassDefinitionWithAllLanguages,
  ResourcePropertyDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';

import { DefaultClass, DefaultProperty, PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { EditResourceClassDialogComponent } from '../edit-resource-class-dialog/edit-resource-class-dialog.component';
import { CreateResourceClassData, UpdateResourceClassData } from '../ontology-form/ontology-form.type';
import { EditPropertyFormDialogComponent } from '../property-form/edit-property-form-dialog.component';
import { PropertyEditData } from '../property-form/property-form.type';
import { OntologyEditService } from './ontology-edit.service';

@Injectable({ providedIn: 'root' })
export class OntologyEditDialogService {
  constructor(
    private _dialog: MatDialog,
    private _dialogService: DialogService,
    private _oes: OntologyEditService
  ) {}

  openCreateNewProperty(propType: DefaultProperty, assignToClass?: ClassDefinition) {
    const dialogRef = this._dialog.open<EditPropertyFormDialogComponent, PropertyInfoObject, PropertyEditData>(
      EditPropertyFormDialogComponent,
      {
        data: { propType },
      }
    );

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is PropertyEditData => !!result)
      )
      .subscribe(propertyData => {
        this._oes.createResourceProperty(propertyData, assignToClass);
      });
  }

  openEditProperty(propDef: ResourcePropertyDefinitionWithAllLanguages, propType: DefaultProperty) {
    const propertyData: PropertyEditData = {
      id: propDef.id,
      propType,
      name: propDef.id?.split('#').pop() || '',
      label: propDef.labels,
      comment: propDef.comments,
      guiElement: propDef.guiElement,
      guiAttribute: propDef.guiAttributes[0],
      objectType: propDef.objectType,
    };
    const dialogRef = this._dialog.open<EditPropertyFormDialogComponent, PropertyEditData, PropertyEditData>(
      EditPropertyFormDialogComponent,
      DspDialogConfig.dialogDrawerConfig(propertyData)
    );

    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is PropertyEditData => !!result),
        switchMap(pData => {
          return this._oes.updateProperty$(propDef.id, pData).pipe(take(1));
        })
      )
      .subscribe();
  }

  openEditResourceClass(resClass: ResourceClassDefinitionWithAllLanguages): void {
    const classData: UpdateResourceClassData = {
      id: resClass.id,
      labels: resClass.labels,
      comments: resClass.comments,
    };
    this._dialog
      .open<EditResourceClassDialogComponent, UpdateResourceClassData, UpdateResourceClassData>(
        EditResourceClassDialogComponent,
        DspDialogConfig.dialogDrawerConfig(classData)
      )
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is UpdateResourceClassData => !!result),
        switchMap(resourceClassData => {
          return this._oes.updateResourceClass$(resourceClassData).pipe(take(1));
        })
      )
      .subscribe();
  }

  openCreateResourceClass(defaultClass: DefaultClass): void {
    this._dialog
      .open<EditResourceClassDialogComponent, DefaultClass, CreateResourceClassData>(
        EditResourceClassDialogComponent,
        DspDialogConfig.dialogDrawerConfig(defaultClass)
      )
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is CreateResourceClassData => !!result),
        switchMap(resourceClassData => {
          return this._oes.createResourceClass$(resourceClassData).pipe(take(1));
        })
      )
      .subscribe();
  }

  openDeleteOntology$(id: string): Observable<DeleteOntologyResponse> {
    return this._dialogService.afterConfirmation('Do you want to delete this data model ?').pipe(
      switchMap(_del => {
        return this._oes.deleteOntology$(id);
      })
    );
  }

  openDeleteProperty(id: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this resource class ?')
      .pipe(switchMap(_del => this._oes.deleteProperty(id)))
      .subscribe();
  }

  openDeleteResourceClass(id: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this resource class ?')
      .pipe(switchMap(_del => this._oes.deleteResourceClass$(id)))
      .subscribe();
  }
}
