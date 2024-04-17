import { ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { KnoraApiConnection, ReadProject, ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { CreateResourceDialogProps, CreateRessourceDialogComponent } from '@dasch-swiss/vre/shared/app-resource-form';
import { ProjectsSelectors } from '@dasch-swiss/vre/shared/app-state';
import { TempLinkValueService } from '@dsp-app/src/app/workspace/resource/temp-link-value.service';
import { Store } from '@ngxs/store';
import { filter, switchMap } from 'rxjs/operators';
import { LinkValue2DataService } from './link-value-2-data.service';

@Component({
  selector: 'app-link-value-2',
  template: `
    <mat-form-field style="width: 100%">
      <input
        matInput
        [formControl]="control"
        aria-label="resource"
        placeholder="Name of an existing resource"
        data-cy="link-input"
        [matAutocomplete]="auto" />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayResource.bind(this)">
        <mat-option *ngIf="resources.length === 0" [disabled]="true"> No results were found.</mat-option>
        <mat-option
          *ngFor="let rc of _linkValue2DataService.resourceClasses"
          (click)="openCreateResourceDialog($event, rc.id, rc.label)">
          Create New: {{ rc?.label }}
        </mat-option>
        <mat-option *ngFor="let res of resources" [value]="res.id"> {{ res.label }}</mat-option>
      </mat-autocomplete>
      <mat-hint>{{ 'appLabels.form.action.searchHelp' | translate }}</mat-hint>
      <mat-error *ngIf="control.errors as errors">{{ errors | humanReadableError }}</mat-error>
    </mat-form-field>
  `,
  providers: [LinkValue2DataService],
})
export class LinkValue2Component implements OnInit {
  @Input({ required: true }) control: FormControl<string>;
  @Input() propIri: string;

  @ViewChild(MatAutocompleteTrigger) autoComplete: MatAutocompleteTrigger;

  resources: ReadResource[] = [];

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _tempLinkValueService: TempLinkValueService,
    private _dialog: MatDialog,
    private _cd: ChangeDetectorRef,
    public _linkValue2DataService: LinkValue2DataService,
    private _store: Store
  ) {}

  ngOnInit() {
    this.control.valueChanges
      .pipe(
        filter(searchTerm => searchTerm?.length >= 3),
        filter(searchTerm => !searchTerm.startsWith('http')),
        switchMap((searchTerm: string) =>
          this._dspApiConnection.v2.search.doSearchByLabel(searchTerm, 0, {
            limitToResourceClass: this._getRestrictToResourceClass(),
          })
        )
      )
      .subscribe((response: ReadResourceSequence) => {
        this.resources = response.resources;
        this._cd.detectChanges();
      });

    this._linkValue2DataService.onInit(
      this._tempLinkValueService.currentOntoIri,
      this._tempLinkValueService.parentResource,
      this.propIri
    );
  }

  openCreateResourceDialog(event: any, resourceClassIri: string, resourceType: string) {
    let myResourceId: string;

    event.stopPropagation();
    const projectIri = (this._store.selectSnapshot(ProjectsSelectors.currentProject) as ReadProject).id;
    this._dialog
      .open<CreateRessourceDialogComponent, CreateResourceDialogProps, string>(CreateRessourceDialogComponent, {
        data: {
          resourceType,
          resourceClassIri,
          projectIri,
        },
      })
      .afterClosed()
      .pipe(
        switchMap(resourceId => {
          myResourceId = resourceId as string;
          return this._dspApiConnection.v2.res.getResource(myResourceId);
        })
      )
      .subscribe((res: ReadResource) => {
        this.resources.push(res);
        this.control.setValue(myResourceId);
        this.autoComplete.closePanel();
        this._cd.detectChanges();
      });
  }

  private _getRestrictToResourceClass() {
    const linkType = this._tempLinkValueService.parentResource.getLinkPropertyIriFromLinkValuePropertyIri(this.propIri);
    return this._tempLinkValueService.parentResource.entityInfo.properties[linkType].objectType;
  }

  displayResource(resId: string | null): string {
    if (!this.resources || resId === null) return '';
    return this.resources.find(res => res.id === resId)?.label ?? '';
  }
}
