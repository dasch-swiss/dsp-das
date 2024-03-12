import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Constants,
  KnoraApiConnection,
  ReadResource,
  ReadResourceSequence,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { filter, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-link-value-2',
  template: `
    <mat-form-field class="child-value-component" floatLabel="never">
      <div class="search-input">
        <input
          matInput
          [formControl]="control"
          class="value"
          type="text"
          [placeholder]="'appLabels.form.action.searchHelp' | translate"
          aria-label="resource"
          [matAutocomplete]="auto" />
        <span matSuffix class="progress-indicator">
          <dasch-swiss-app-progress-indicator *ngIf="loadingResults" [status]="0"></dasch-swiss-app-progress-indicator>
        </span>
      </div>
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayResource">
        <mat-option *ngIf="resources.length === 0" disabled="true"> No results were found.</mat-option>
        <!--<mat-option *ngFor="let rc of resourceClasses" (click)="openDialog('createLinkResource', $event, propIri, rc)">
                                                                                                                                                                  Create New: {{ rc?.label }}
                                                                                                                                                                </mat-option>-->
        <mat-option *ngFor="let res of resources" [value]="res"> {{ res?.label }}</mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
})
export class LinkValue2Component implements OnInit {
  @Input() control: FormControl<any>;
  @Input() propIri: string;
  @Input() currentOntoIri: string;
  @Input() parentResource: ReadResource;

  loadingResults = false;

  resourceClasses: ResourceClassDefinition[];
  subClasses: ResourceClassDefinition[] = [];
  restrictToResourceClass: string;
  resourceClassLabel: string;

  resources: ReadResource[] = [];
  properties: ResourcePropertyDefinition[];

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  ngOnInit() {
    // in case the resource is referencing itself, assign the parent resource to linkedResource
    /*
                                                                                          if (this.displayValue && this.displayValue.linkedResourceIri === this.parentResource.id) {
                                                                                            this.displayValue.linkedResource = this.parentResource;
                                                                                          }
                                                                                             */

    const linkType = this.parentResource.getLinkPropertyIriFromLinkValuePropertyIri(this.propIri);
    this.restrictToResourceClass = this.parentResource.entityInfo.properties[linkType].objectType;

    // get label of resource class
    this._dspApiConnection.v2.ontologyCache
      .getResourceClassDefinition(this.restrictToResourceClass)
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        this.resourceClassLabel = onto.classes[this.restrictToResourceClass].label;
      });

    this._dspApiConnection.v2.ontologyCache
      .getOntology(this.currentOntoIri)
      .pipe(map(ontoMap => new Map(Array.from(ontoMap).filter(([key]) => key !== Constants.KnoraApiV2))))
      .subscribe(filteredOntoMap => {
        let resClasses = [];

        // loop through each ontology in the project and create an array of ResourceClassDefinitions
        filteredOntoMap.forEach(onto => {
          resClasses = resClasses.concat(
            filteredOntoMap.get(onto.id).getClassDefinitionsByType(ResourceClassDefinition)
          );
        });

        // add the superclass to the list of resource classes
        // recursively loop through all of the superclass's subclasses, including nested subclasses
        // and add them to the list of resource classes
        this.resourceClasses = resClasses
          .filter((resClassDef: ResourceClassDefinition) => resClassDef.id === this.restrictToResourceClass)
          .concat(this._getSubclasses(resClasses, this.restrictToResourceClass));

        this.properties = filteredOntoMap
          .get(this.currentOntoIri)
          .getPropertyDefinitionsByType(ResourcePropertyDefinition);
      });

    this._onFormChange();
  }

  private _onFormChange() {
    this.control.valueChanges
      .pipe(
        filter(searchTerm => searchTerm.length >= 3),
        switchMap((searchTerm: string) =>
          this._dspApiConnection.v2.search.doSearchByLabel(searchTerm, 0, {
            limitToResourceClass: this.restrictToResourceClass,
          })
        )
      )
      .subscribe((response: ReadResourceSequence) => {
        this.resources = response.resources;
      });
  }

  displayResource(resource: ReadResource | null): string {
    if (resource instanceof ReadResource) {
      return resource.label;
    }
  }

  private _getSubclasses(
    resClasses: ResourceClassDefinition[],
    resClassRestrictionIri: string
  ): ResourceClassDefinition[] {
    // filter list by the provided IRI to find all subclasses of the provided IRI
    const subclasses = resClasses.filter(
      (resClassDef: ResourceClassDefinition) => resClassDef.subClassOf.indexOf(resClassRestrictionIri) > -1
    );

    // add the filtered list to the list of all subclasses
    this.subClasses = this.subClasses.concat(subclasses);

    // if the provided IRI has subclasses, recursively call this function to find any subclasses of those subclasses
    if (subclasses.length) {
      subclasses.forEach(sub => {
        this._getSubclasses(resClasses, sub.id);
      });
    }

    return this.subClasses;
  }
}
