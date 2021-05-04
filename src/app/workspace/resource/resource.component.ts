/* eslint-disable @typescript-eslint/member-ordering */
import { Location } from '@angular/common';
import { Component, Inject, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
    ActivatedRoute,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Params,
    Router
} from '@angular/router';
import {
    ApiResponseError,
    Constants,
    DeleteValue,
    IHasPropertyWithPropertyDefinition,
    KnoraApiConnection,
    ReadLinkValue,
    ReadProject,
    ReadResource,
    ReadResourceSequence,
    ReadStillImageFileValue,
    ReadTextValueAsXml,
    ReadValue,
    SystemPropertyDefinition
} from '@dasch-swiss/dsp-js';
import {
    DspApiConnectionToken,
    NotificationService,
    PropertyInfoValues,
    Region,
    StillImageRepresentation,
    ValueService
} from '@dasch-swiss/dsp-ui';
import { AddedEventValue, DeletedEventValue, Events, UpdatedEventValues, ValueOperationEventService } from '@dasch-swiss/dsp-ui';
import { Subscription } from 'rxjs';
import { DspResource } from './dsp-resource';
import { IncomingService } from './incoming.service';

@Component({
    selector: 'app-resource',
    templateUrl: './resource.component.html',
    styleUrls: ['./resource.component.scss'],
    providers: [ValueOperationEventService] // provide service on the component level so that each implementation of this component has its own instance.
})
export class ResourceComponent implements OnInit, OnChanges, OnDestroy {

    @Input() resourceIri: string;

    resource: DspResource;

    resPropInfoVals: PropertyInfoValues[] = []; // array of resource properties

    systemPropDefs: SystemPropertyDefinition[] = []; // array of system properties

    valueOperationEventSubscriptions: Subscription[] = []; // array of ValueOperationEvent subscriptions

    stillImageRepresentations: StillImageRepresentation[];
    incomingStillImageRepresentationCurrentOffset: number;

    showAllProps = false;

    loading = true;

    refresh: boolean;

    navigationSubscription: Subscription;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _incomingService: IncomingService,
        private _location: Location,
        private _notification: NotificationService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _titleService: Title,
        private _valueOperationEventService: ValueOperationEventService,
        private _valueService: ValueService
    ) {

        if (!this.resourceIri) {
            this.resourceIri = this._route.snapshot.params.id;
            this.getResource(this.resourceIri);
        }

        this._router.events.subscribe((event) => {

            this._titleService.setTitle('Resource view');

            if (event instanceof NavigationStart) {
                // show loading indicator
                // console.log('NavigationStart', this.resourceIri);
            }

            if (event instanceof NavigationEnd) {
                // hide loading indicator
                this.refresh = true;
                // console.log('NavigationEnd', this.resourceIri);
                this.refresh = false;
            }

            if (event instanceof NavigationError) {
                // hide loading indicator

                // present error to user
                this._notification.openSnackBar(event.error);

            }

        });
    }

    ngOnInit() {
        // subscribe to the ValueOperationEventService and listen for an event to be emitted
        this.valueOperationEventSubscriptions.push(this._valueOperationEventService.on(
            Events.ValueAdded, (newValue: AddedEventValue) =>
                this.addValueToResource(newValue.addedValue)
        ));

        this.valueOperationEventSubscriptions.push(this._valueOperationEventService.on(
            Events.ValueUpdated, (updatedValue: UpdatedEventValues) =>
                this.updateValueInResource(updatedValue.currentValue, updatedValue.updatedValue)
        ));

        this.valueOperationEventSubscriptions.push(this._valueOperationEventService.on(
            Events.ValueDeleted, (deletedValue: DeletedEventValue) =>
                this.deleteValueFromResource(deletedValue.deletedValue)
        ));

    }

    ngOnChanges() {
        // get resource with all necessary information
        if (this.resourceIri) {
            this.getResource(this.resourceIri);
        }
    }

    ngOnDestroy() {
        if (this.navigationSubscription !== undefined) {
            this.navigationSubscription.unsubscribe();
        }
        // unsubscribe from the ValueOperationEventService when component is destroyed
        if (this.valueOperationEventSubscriptions !== undefined) {
            this.valueOperationEventSubscriptions.forEach(sub => sub.unsubscribe());
        }
    }


    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // general methods
    // ------------------------------------------------------------------------
    goBack() {
        // --> TODO: is this still needed?
        this._location.back();
    }

    // open project in new tab
    openProject(project: ReadProject) {
        window.open('/project/' + project.shortcode, '_blank');
    }

    openResource(linkValue: ReadLinkValue) {
        window.open('/resource/' + encodeURIComponent(linkValue.linkedResource.id), '_blank');
    }

    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // get and display resource
    // ------------------------------------------------------------------------

    /**
     * get a read resource sequence with ontology information and incoming resources.
     *
     * @param iri resourceIri
     */
    getResource(iri: string): void {

        if (!iri) {
            return;
        }

        // reset still image representations
        this.stillImageRepresentations = [];

        this._dspApiConnection.v2.res.getResource(iri).subscribe(
            (response: ReadResource) => {

                const res = new DspResource(response);

                this.collectImagesAndRegionsForResource(res);
                this.resource = res;

                console.log(this.resource);

                // find resource type and get representation info
                // this.getIncomingStillImageRepresentations(2)


                // gather resource property information
                this.resPropInfoVals = this.resource.readResource.entityInfo.classes[this.resource.readResource.type].getResourcePropertiesList().map(
                    (prop: IHasPropertyWithPropertyDefinition) => {
                        let propInfoAndValues: PropertyInfoValues;

                        switch (prop.propertyDefinition.objectType) {
                            case Constants.StillImageFileValue:
                                propInfoAndValues = {
                                    propDef: prop.propertyDefinition,
                                    guiDef: prop,
                                    values: this.resource.readResource.getValuesAs(prop.propertyIndex, ReadStillImageFileValue)
                                };
                                this.stillImageRepresentations = [new StillImageRepresentation(
                                    this.resource.readResource.getValuesAs(Constants.HasStillImageFileValue, ReadStillImageFileValue)[0], [])
                                ];

                                // --> TODO: get regions here

                                break;

                            default:
                                // the object type is none from above;
                                // get incoming stillImages (in case of a compound object)
                                // this.getIncomingStillImageRepresentations(0)


                                propInfoAndValues = {
                                    propDef: prop.propertyDefinition,
                                    guiDef: prop,
                                    values: this.resource.readResource.getValues(prop.propertyIndex)
                                };
                        }

                        return propInfoAndValues;
                    }
                );

                console.log(this.resPropInfoVals);

                // sort properties by guiOrder
                this.resPropInfoVals =
                    this.resPropInfoVals
                        .filter(prop => prop.propDef.objectType !== Constants.GeomValue)
                        .sort((a, b) => (a.guiDef.guiOrder > b.guiDef.guiOrder) ? 1 : -1);

                // get system property information
                this.systemPropDefs = this.resource.readResource.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);

                this.loading = false;

            },
            (error: ApiResponseError) => {
                this._notification.openSnackBar(error);
            });
    }

    protected collectImagesAndRegionsForResource(resource: DspResource): void {

        const imgRepresentations: StillImageRepresentation[] = [];

        if (resource.readResource.properties[Constants.HasStillImageFileValue] !== undefined) {
            // --> TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)
            // resource has StillImageFileValues that are directly attached to it (properties)

            const fileValues: ReadStillImageFileValue[] = resource.readResource.properties[Constants.HasStillImageFileValue] as ReadStillImageFileValue[];

            for (const img of fileValues) {

                const regions: Region[] = [];
                for (const incomingRegion of resource.incomingRepresentationAnnotations) {

                    const region = new Region(incomingRegion);

                    regions.push(region);

                }

                const stillImage = new StillImageRepresentation(img, regions);
                imgRepresentations.push(stillImage);

            }


        } else if (resource.incomingRepresentations.length > 0) {
            // there are StillImageRepresentations pointing to this resource (incoming)

            const readStillImageFileValues: ReadStillImageFileValue[] = resource.incomingRepresentations.map(
                (stillImageRes: ReadResource) => {
                    const fileValues = stillImageRes.properties[Constants.HasStillImageFileValue] as ReadStillImageFileValue[];
                    // --> TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)

                    return fileValues;
                }
            ).reduce((prev, curr) => {
                // transform ReadStillImageFileValue[][] to ReadStillImageFileValue[]
                return prev.concat(curr);
            });

            for (const img of readStillImageFileValues) {

                const regions: Region[] = [];
                for (const incomingRegion of resource.incomingRepresentationAnnotations) {

                    const region = new Region(incomingRegion);
                    regions.push(region);

                }

                const stillImage = new StillImageRepresentation(img, regions);
                imgRepresentations.push(stillImage);
            }

        }

        resource.representationsToDisplay = imgRepresentations;
    }

    /**
     * requests incoming resources for [[this.resource]].
     * Incoming resources are: regions, StillImageRepresentations, and incoming links.
     *
     *
     */
    protected requestIncomingResources(): void {

        // make sure that this.resource has been initialized correctly
        if (this.resource === undefined) {
            return;
        }

        // request incoming regions --> TODO: add case to get incoming sequences in case of video and audio
        if (this.resource.readResource.properties[Constants.HasStillImageFileValue]) {
            // --> TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)
            // the resource is a StillImageRepresentation, check if there are regions pointing to it

            this.getIncomingRegions(0);

        } else {
            // this resource is not a StillImageRepresentation
            // check if there are StillImageRepresentations pointing to this resource

            // this gets the first page of incoming StillImageRepresentations
            // more pages may be requested by [[this.viewer]].
            // --> TODO: for now, we begin with offset 0. This may have to be changed later (beginning somewhere in a collection)
            this.getIncomingStillImageRepresentations(0);
        }

        // check for incoming links for the current resource
        this.getIncomingLinks(0);

    }

    /**
     * gets the incoming regions for [[this.resource]].
     *
     * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
     */
    protected getIncomingRegions(offset: number): void {
        this._incomingService.getIncomingRegions(this.resource.readResource.id, offset).subscribe(
            (regions: ReadResourceSequence) => {

                // append elements of regions.resources to resource.incoming
                Array.prototype.push.apply(this.resource.incomingRepresentationAnnotations, regions.resources);

                // prepare regions to be displayed
                // triggers ngOnChanges of StillImageComponent
                this.collectImagesAndRegionsForResource(this.resource);

            },
            (error: any) => {
                this._notification.openSnackBar(error);
            }
        );
    }

    /**
     * get StillImageRepresentations pointing to [[this.resource]].
     * This method may have to called several times with an increasing offsetChange in order to get all available StillImageRepresentations.
     *
     * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
     * It takes the number of images returned as an argument.
     */
    protected getIncomingStillImageRepresentations(offset: number): void {
        // make sure that this.resource has been initialized correctly
        if (this.resource === undefined) {
            return;
        }

        if (offset < 0) {
            console.log(`offset of ${offset} is invalid`);
            return;
        }

        this._incomingService.getStillImageRepresentationsForCompoundResource(this.resource.readResource.id, offset).subscribe(
            (incomingImageRepresentations: ReadResourceSequence) => {

                // console.log(incomingImageRepresentations);

                if (incomingImageRepresentations.resources.length > 0) {

                    // set current offset
                    this.incomingStillImageRepresentationCurrentOffset = offset;

                    // --> TODO: implement prepending of StillImageRepresentations when moving to the left (getting previous pages)
                    // --> TODO: append existing images to response and then assign response to `this.resource.incomingStillImageRepresentations`
                    // --> TODO: maybe we have to support non consecutive arrays (sparse arrays)

                    // append incomingImageRepresentations.resources to this.resource.incomingStillImageRepresentations
                    Array.prototype.push.apply(this.resource.incomingRepresentations, incomingImageRepresentations.resources);

                    // prepare attached image files to be displayed
                    this.collectImagesAndRegionsForResource(this.resource);
                }
            },
            (error: any) => {
                this._notification.openSnackBar(error);
            }
        );

    }

    /**
     * get resources pointing to [[this.resource]] with properties other than knora-api:isPartOf and knora-api:isRegionOf.
     *
     * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
     * It takes the number of images returned as an argument.
     */
    protected getIncomingLinks(offset: number): void {

        this._incomingService.getIncomingLinksForResource(this.resource.readResource.id, offset).subscribe(
            (incomingResources: ReadResourceSequence) => {

                // append elements incomingResources to this.resource.incomingLinks
                Array.prototype.push.apply(this.resource.readResource.incomingReferences, incomingResources.resources);
            },
            (error: any) => {
                this._notification.openSnackBar(error);
            }
        );
    }

    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // edit and update
    // ------------------------------------------------------------------------
    /**
     * updates the UI in the event of a new value being added to show the new value
     *
     * @param valueToAdd the value to add to the end of the values array of the filtered property
     */
    addValueToResource(valueToAdd: ReadValue): void {
        if (this.resPropInfoVals) {
            this.resPropInfoVals
                .filter(propInfoValueArray =>
                    propInfoValueArray.propDef.id === valueToAdd.property) // filter to the correct property
                .forEach(propInfoValue =>
                    propInfoValue.values.push(valueToAdd)); // push new value to array
            if (valueToAdd instanceof ReadTextValueAsXml) {
                this._updateStandoffLinkValue();
            }
        } else {
            console.error('No properties exist for this resource');
        }
    }

    /**
     * updates the UI in the event of an existing value being updated to show the updated value
     *
     * @param valueToReplace the value to be replaced within the values array of the filtered property
     * @param updatedValue the value to replace valueToReplace with
     */
    updateValueInResource(valueToReplace: ReadValue, updatedValue: ReadValue): void {
        if (this.resPropInfoVals && updatedValue !== null) {
            this.resPropInfoVals
                .filter(propInfoValueArray =>
                    propInfoValueArray.propDef.id === valueToReplace.property) // filter to the correct property
                .forEach(filteredpropInfoValueArray => {
                    filteredpropInfoValueArray.values.forEach((val, index) => { // loop through each value of the current property
                        if (val.id === valueToReplace.id) { // find the value that should be updated using the id of valueToReplace
                            filteredpropInfoValueArray.values[index] = updatedValue; // replace value with the updated value
                        }
                    });
                });
            if (updatedValue instanceof ReadTextValueAsXml) {
                this._updateStandoffLinkValue();
            }
        } else {
            console.error('No properties exist for this resource');
        }
    }

    /**
     * updates the UI in the event of an existing value being deleted
     *
     * @param valueToDelete the value to remove from the values array of the filtered property
     */
    deleteValueFromResource(valueToDelete: DeleteValue): void {
        if (this.resPropInfoVals) {
            this.resPropInfoVals
                .filter(propInfoValueArray =>  // filter to the correct type
                    this._valueService.compareObjectTypeWithValueType(propInfoValueArray.propDef.objectType, valueToDelete.type))
                .forEach(filteredpropInfoValueArray => {
                    filteredpropInfoValueArray.values.forEach((val, index) => { // loop through each value of the current property
                        if (val.id === valueToDelete.id) { // find the value that was deleted using the id
                            filteredpropInfoValueArray.values.splice(index, 1); // remove the value from the values array
                            if (val instanceof ReadTextValueAsXml) {
                                this._updateStandoffLinkValue();
                            }
                        }
                    });
                }
                );
        } else {
            console.error('No properties exist for this resource');
        }
    }

    /**
     * updates the standoff link value for the resource being displayed.
     *
     */
    private _updateStandoffLinkValue(): void {

        if (this.resource === undefined) {
            // this should never happen:
            // if the user was able to click on a standoff link,
            // then the resource must have been initialised before.
            return;
        }

        const gravsearchQuery = `
 PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
 CONSTRUCT {
     ?res knora-api:isMainResource true .
     ?res knora-api:hasStandoffLinkTo ?target .
 } WHERE {
     BIND(<${this.resource.readResource.id}> as ?res) .
     OPTIONAL {
         ?res knora-api:hasStandoffLinkTo ?target .
     }
 }
 OFFSET 0
 `;

        this._dspApiConnection.v2.search.doExtendedSearch(gravsearchQuery).subscribe(
            (res: ReadResourceSequence) => {

                // one resource is expected
                if (res.resources.length !== 1) {
                    return;
                }

                const newStandoffLinkVals = res.resources[0].getValuesAs(Constants.HasStandoffLinkToValue, ReadLinkValue);

                this.resPropInfoVals.filter(
                    resPropInfoVal => {
                        return resPropInfoVal.propDef.id === Constants.HasStandoffLinkToValue;
                    }
                ).forEach(
                    standoffLinkResPropInfoVal => {
                        // delete all the existing standoff link values
                        standoffLinkResPropInfoVal.values = [];
                        // push standoff link values retrieved for the resource
                        newStandoffLinkVals.forEach(
                            standoffLinkVal => {
                                standoffLinkResPropInfoVal.values.push(standoffLinkVal);
                            }
                        );
                    });

            },
            err => {
                console.error(err);
            }
        );

    }

}
