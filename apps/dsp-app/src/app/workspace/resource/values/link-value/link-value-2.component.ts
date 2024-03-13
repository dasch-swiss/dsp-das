import { ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { KnoraApiConnection, ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { TempLinkValueService } from '@dsp-app/src/app/workspace/resource/values/link-value/temp-link-value.service';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-link-value-2',
  template: `
    <mat-form-field style="width: 100%">
      <input
        matInput
        [formControl]="control"
        aria-label="resource"
        placeholder="Name of an existing resource"
        [matAutocomplete]="auto" />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayResource.bind(this)">
        <mat-option *ngIf="resources.length === 0" disabled="true"> No results were found.</mat-option>
        <!--<mat-option *ngFor="let rc of resourceClasses" (click)="openDialog('createLinkResource', $event, propIri, rc)">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          Create New: {{ rc?.label }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </mat-option>-->
        <mat-option *ngFor="let res of resources" [value]="res.id"> {{ res.label }}</mat-option>
      </mat-autocomplete>
      <mat-hint>{{ 'appLabels.form.action.searchHelp' | translate }}</mat-hint>
      <mat-error *ngIf="control.errors as errors">{{ errors | humanReadableError }}</mat-error>
    </mat-form-field>
  `,
})
export class LinkValue2Component implements OnInit {
  @Input() control: FormControl<any>;
  @Input() propIri: string;

  @ViewChild('auto') autoComplete: MatAutocompleteTrigger;

  resources: ReadResource[] = [];

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _tempLinkValueService: TempLinkValueService,
    private _cd: ChangeDetectorRef
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
  }

  private _getRestrictToResourceClass() {
    const linkType = this._tempLinkValueService.parentResource.getLinkPropertyIriFromLinkValuePropertyIri(this.propIri);
    return this._tempLinkValueService.parentResource.entityInfo.properties[linkType].objectType;
  }

  displayResource(resId: string | undefined): string {
    return this.resources.find(res => res.id === resId).label;
  }
}
