import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KnoraApiConnection, ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { TempLinkValueService } from '@dsp-app/src/app/workspace/resource/values/link-value/temp-link-value.service';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-link-value-2',
  template: `
    <mat-form-field>
      <input
        matInput
        [formControl]="control"
        [placeholder]="'appLabels.form.action.searchHelp' | translate"
        aria-label="resource"
        [matAutocomplete]="auto" />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayResource">
        <mat-option *ngIf="resources.length === 0" disabled="true"> No results were found.</mat-option>
        <!--<mat-option *ngFor="let rc of resourceClasses" (click)="openDialog('createLinkResource', $event, propIri, rc)">
                                                                                                                                                                                                                                                                                                                                                                                                                  Create New: {{ rc?.label }}
                                                                                                                                                                                                                                                                                                                                                                                                                </mat-option>-->
        <mat-option *ngFor="let res of resources" [value]="res.id"> {{ res.label }}</mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class LinkValue2Component implements OnInit {
  @Input() control: FormControl<any>;
  @Input() propIri: string;

  get parentResource() {
    return this._tempLinkValueService.parentResource;
  }

  resources: ReadResource[] = [];

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _tempLinkValueService: TempLinkValueService
  ) {}

  ngOnInit() {
    this.control.valueChanges
      .pipe(
        filter(searchTerm => searchTerm?.length >= 3),
        switchMap((searchTerm: string) =>
          this._dspApiConnection.v2.search.doSearchByLabel(searchTerm, 0, {
            limitToResourceClass: this._getRestrictToResourceClass(),
          })
        )
      )
      .subscribe((response: ReadResourceSequence) => {
        this.resources = response.resources;
      });
  }

  private _getRestrictToResourceClass() {
    const linkType = this.parentResource.getLinkPropertyIriFromLinkValuePropertyIri(this.propIri);
    return this.parentResource.entityInfo.properties[linkType].objectType;
  }

  displayResource(resId: string | undefined): string {
    if (!resId || !this.resources || this.resources.length === 0) return '';
    return this.resources.find(res => res.id === resId).label;
  }
}
