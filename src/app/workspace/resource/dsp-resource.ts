import { Directive, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ReadIntValue,
    ReadLinkValue,
    ReadResource,
    ReadTextValue,
    ReadValue,
    SystemPropertyDefinition
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, PropertyInfoValues, StillImageComponent, StillImageRepresentation } from '@dasch-swiss/dsp-ui';
import { Subscription } from 'rxjs';
import { IncomingService } from './incoming.service';

export class DspResource {

    res: ReadResource;

    resProps: PropertyInfoValues[] = []; // array of resource properties

    systemProps: SystemPropertyDefinition[] = []; // array of system properties

    // regions or sequences
    incomingAnnotations: ReadResource[] = [];

    // incoming stillImages, movingImages, audio etc.
    incomingRepresentations: ReadResource[] = [];

    constructor(resource: ReadResource) {

        this.res = resource;
    }
}

export class DspCompoundPosition {
    offset: number;         // current offset of search requests
    maxOffsets: number;     // max offsets in relation to totalPages
    position: number;       // current item position in offset sequence
    page: number;           // current and real page number in compound object
    totalPages: number;     // total pages (part of) in compound object

    constructor(totalPages: number) {
        this.totalPages = totalPages;
        this.maxOffsets = Math.ceil(totalPages / 25) - 1;;
    }
}

export interface PropIriToNameMapping {
    [index: string]: string;
}

export interface PropertyValues {
    [index: string]: ReadValue[];
}

class PageProps implements PropertyValues {

    [index: string]: ReadValue[];

    pagenum: ReadTextValue[] = [];
    seqnum: ReadIntValue[] = [];
    partOf: ReadLinkValue[] = [];

}


@Directive()
export abstract class DspCompoundResource implements OnInit, OnDestroy {

    action: string; // label for the snackbar action
    message: string; // message to show in the snackbar to confirm the copy of the ARK URL
    protected params;
    abstract iri: string;
    abstract resource: DspResource;
    abstract isLoading = true;
    abstract errorMessage: any;
    abstract incomingStillImageRepresentationCurrentOffset: number;
    abstract navigationSubscription: Subscription;
    abstract dspConstants: Constants;
    abstract propIris: PropIriToNameMapping;

    // @ViewChild('OSDViewer') osdViewer: StillImageComponent;

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        protected _route: ActivatedRoute,
        protected _incomingService: IncomingService,
        protected _snackBar: MatSnackBar) {
    }


    /**
     * given a `PropIriToNameMapping`, inverts its keys and values.
     *
     * @param propMapping mapping of names to property Iris.
     * @returns mapping of property Iris to names.
     */
    private static _swap(propMapping: PropIriToNameMapping): object {
        const invertedMapping: PropIriToNameMapping = {};
        for (const key in propMapping) {
            if (propMapping.hasOwnProperty(key)) {
                invertedMapping[propMapping[key]] = key;
            }
        }
        return invertedMapping;
    }

    /**
     * the user clicked on an internal link.
     *
     * @param linkVal the value representing the referred resource.
     */
    resLinkClicked(linkVal: ReadLinkValue) {

        const refResType = (linkVal.linkedResource !== undefined ? linkVal.linkedResource.type : '');

        // --> TODO: create "onClicked" output
        // this._beolService.routeByResourceType(refResType, linkVal.linkedResourceIri, linkVal.linkedResource);
    }

    ngOnInit() {
        // this.navigationSubscription = this._route.paramMap.subscribe((params: ParamMap) => {
        //     this.params = params;
        //     this.iri = params.get('id');
        //     if (this.iri) {
        //         this.getResource(this.iri);
        //     }
        // });

    }

    ngOnDestroy() {
        if (this.navigationSubscription !== undefined) {
            this.navigationSubscription.unsubscribe();
        }
    }


    /**
     * assigns the resource's properties to `propClass`.
     *
     * @param propClass instance to assign the property values to.
     */
    protected mapper(propClass: PropertyValues) {

        const swapped = DspCompoundResource._swap(this.propIris);

        for (const key in this.resource.res.properties) {
            if (this.resource.res.properties.hasOwnProperty(key)) {
                for (const val of this.resource.res.properties[key]) {
                    const name = swapped[val.property];

                    if (name !== undefined && Array.isArray(propClass[name])) {
                        propClass[name].push(val);
                    }
                }
            }
        }
    }


    /**
     * initializes properties for a specific resource class.
     * To be implemented in template component.
     */
    abstract initProps(): void;

    /**
     * requests a resource.
     *
     * @param iri the Iri of the resource to be requested.
     */
    // getResource(iri: string): void {

    //     this._dspApiConnection.v2.res.getResource(iri)
    //         .subscribe(
    //             (result: ReadResource) => {

    //                 // console.log(result)

    //                 const res = new DspCompoundResource(result);

    //                 // prepare a possibly attached image file to be displayed
    //                 DspResource.collectImagesAndRegionsForResource(res);

    //                 this.resource = res;

    //                 this.initProps();

    //                 this.isLoading = false;

    //                 this.requestIncomingResources();

    //             },
    //             (error: any) => {
    //                 this.errorMessage = error;
    //                 this.isLoading = false;
    //             }
    //         );
    // }


}
