import {
    Component,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
    CreateLinkValue,
    KnoraApiConnection,
    ReadLinkValue,
    ReadOntology,
    ReadResource,
    ReadResourceSequence,
    ResourceClassAndPropertyDefinitions,
    ResourceClassDefinition,
    ResourcePropertyDefinition,
    UpdateLinkValue
} from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { DialogComponent, DialogEvent } from 'src/app/main/dialog/dialog.component';
import { BaseValueDirective } from 'src/app/main/directive/base-value.directive';

export function resourceValidator(control: AbstractControl) {
    const invalid = !(control.value === null || control.value === '' || control.value instanceof ReadResource);
    return invalid ? { invalidType: { value: control.value } } : null;
}

// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'app-link-value',
    templateUrl: './link-value.component.html',
    styleUrls: ['./link-value.component.scss']
})

export class LinkValueComponent extends BaseValueDirective implements OnInit, OnChanges, OnDestroy {
    @Input() displayValue?: ReadLinkValue;
    @Input() parentResource: ReadResource;
    @Input() propIri: string;
    @Input() currentOntoIri: string;

    @Output() referredResourceClicked: EventEmitter<ReadLinkValue> = new EventEmitter();
    @Output() referredResourceHovered: EventEmitter<ReadLinkValue> = new EventEmitter();

    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

    resources: ReadResource[] = [];
    restrictToResourceClass: string;
    valueFormControl: FormControl;
    commentFormControl: FormControl;
    form: FormGroup;
    resourceClassLabel: string;

    valueChangesSubscription: Subscription;
    labelChangesSubscription: Subscription;
    // label cannot contain logical operations of lucene index
    customValidators = [resourceValidator];

    resourceClasses: ResourceClassDefinition[];
    subClasses: ResourceClassDefinition[] = [];
    properties: ResourcePropertyDefinition[];

    loadingResults = false;
    showNoResultsMessage = false;

    constructor(
        private _dialog: MatDialog,
        @Inject(FormBuilder) private _fb: FormBuilder,
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection) {
        super();
    }

    /**
     * displays a selected resource using its label.
     *
     * @param resource the resource to be displayed (or no selection yet).
     */
    displayResource(resource: ReadResource | null): string {
        // null is the initial value (no selection yet)
        if (resource instanceof ReadResource) {
            return resource.label;
        }
    }

    /**
     * search for resources whose labels contain the given search term, restricting to to the given properties object constraint.
     * this is to be used for update and new linked resources
     *
     * @param searchTerm label to be searched
     */
    searchByLabel(searchTerm: string) {
        this.showNoResultsMessage = false;

        // at least 3 characters are required
        if (typeof searchTerm === 'string' && searchTerm.length >= 3) {
            this.loadingResults = true;
            this._dspApiConnection.v2.search.doSearchByLabel(
                searchTerm, 0, { limitToResourceClass: this.restrictToResourceClass }).subscribe(
                (response: ReadResourceSequence) => {
                    this.resources = response.resources;
                    this.loadingResults = false;
                    this.showNoResultsMessage = this.resources.length > 0 ? false : true;
                });
        } else {
            this.resources = [];
        }
    }

    // show the label of the linked resource
    getInitValue(): ReadResource | null {
        if (this.displayValue !== undefined) {
            return this.displayValue.linkedResource;
        } else {
            return null;
        }
    }

    standardValueComparisonFunc(initValue: ReadResource, curValue: ReadResource | string | null): boolean {
        return (curValue instanceof ReadResource) && initValue.id === curValue.id;
    }

    ngOnInit() {
        const linkType = this.parentResource.getLinkPropertyIriFromLinkValuePropertyIri(this.propIri);
        this.restrictToResourceClass = this.parentResource.entityInfo.properties[linkType].objectType;

        // get label of resource class
        this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(this.restrictToResourceClass).subscribe(
            (onto: ResourceClassAndPropertyDefinitions) => {
                this.resourceClassLabel = onto.classes[this.restrictToResourceClass].label;
            }
        );

        this._dspApiConnection.v2.ontologyCache.getOntology(this.currentOntoIri).subscribe(
            (onto: Map<string, ReadOntology>) => {
                const resClasses = onto.get(this.currentOntoIri).getClassDefinitionsByType(ResourceClassDefinition);

                // add the superclass to the list of resource classes
                this.resourceClasses = resClasses.filter(
                    (resClassDef: ResourceClassDefinition) => resClassDef.id === this.restrictToResourceClass
                );

                // recursively loop through all of the superclass's subclasses, including nested subclasses
                // and add them to the list of resource classes
                this.resourceClasses = this.resourceClasses.concat(this._getSubclasses(resClasses, this.restrictToResourceClass));

                this.properties = onto.get(this.currentOntoIri).getPropertyDefinitionsByType(ResourcePropertyDefinition);
            },
            error => {
                console.error(error);
            }
        );

        // initialize form control elements
        this.valueFormControl = new FormControl(null);

        this.commentFormControl = new FormControl(null);

        // subscribe to any change on the comment and recheck validity
        this.valueChangesSubscription = this.commentFormControl.valueChanges.subscribe(
            data => {
                this.valueFormControl.updateValueAndValidity();
            }
        );

        this.labelChangesSubscription = this.valueFormControl.valueChanges.subscribe(data => {
            this.searchByLabel(data);
        });

        this.form = this._fb.group({
            value: this.valueFormControl,
            comment: this.commentFormControl
        });

        this.resetFormControl();

        resolvedPromise.then(() => {
            // add form to the parent form group
            this.addToParentFormGroup(this.formName, this.form);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.resetFormControl();
    }

    // unsubscribe when the object is destroyed to prevent memory leaks
    ngOnDestroy(): void {
        this.unsubscribeFromValueChanges();

        if (this.labelChangesSubscription !== undefined) {
            this.labelChangesSubscription.unsubscribe();
        }

        resolvedPromise.then(() => {
            // remove form from the parent form group
            this.removeFromParentFormGroup(this.formName);
        });
    }

    getNewValue(): CreateLinkValue | false {
        if (this.mode !== 'create' || !this.form.valid || this.isEmptyVal()) {
            return false;
        }
        const newLinkValue = new CreateLinkValue();
        newLinkValue.linkedResourceIri = this.valueFormControl.value.id;

        if (this.commentFormControl.value !== null && this.commentFormControl.value !== '') {
            newLinkValue.valueHasComment = this.commentFormControl.value;
        }

        return newLinkValue;
    }

    getUpdatedValue(): UpdateLinkValue | false {
        if (this.mode !== 'update' || !this.form.valid) {
            return false;
        }

        const updatedLinkValue = new UpdateLinkValue();

        updatedLinkValue.id = this.displayValue.id;

        updatedLinkValue.linkedResourceIri = this.valueFormControl.value.id;

        // add the submitted comment to updatedLinkValue only if user has added a comment
        if (this.commentFormControl.value !== null && this.commentFormControl.value !== '') {
            updatedLinkValue.valueHasComment = this.commentFormControl.value;
        }

        return updatedLinkValue;
    }

    /**
     * emits the displayValue on click.
     */
    refResClicked() {
        this.referredResourceClicked.emit(this.displayValue);
    }

    /**
     * emits the displayValue on hover.
     */
    refResHovered() {
        this.referredResourceHovered.emit(this.displayValue);
    }

    openDialog(mode: string, ev: Event, iri?: string, resClass?: ResourceClassDefinition): void {
        ev.preventDefault();
        const dialogConfig: MatDialogConfig = {
            width: '840px',
            maxHeight: '80vh',
            position: {
                top: '112px'
            },
            data: { mode: mode, title: resClass.label, id: iri, parentResource: this.parentResource, resourceClassDefinition: resClass.id, ontoIri: this.currentOntoIri },
            disableClose: true
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((event: ReadResource | DialogEvent) => {
            // save button clicked
            if (event instanceof ReadResource ) {
                const newResource = event as ReadResource;

                // set value of value form control to the newly created resource
                this.form.controls.value.setValue(newResource);

                // hide the autocomplete results
                this.autocomplete.closePanel();
            }

            // cancel button clicked
            if (event === DialogEvent.DialogCanceled){
                this.resetFormControl();

                // hide the autocomplete results
                this.autocomplete.closePanel();
            }
        });
    }

    /**
     * given a resource class Iri, return all subclasses
     * @param resClasses List of all resource class definitions in the ontology
     * @param resClassRestrictionIri The IRI of the resource class to filter the list of resource class defintions by
     * @returns An array of all subclasses of type ResourceClassDefinition
     */
    private _getSubclasses(resClasses: ResourceClassDefinition[], resClassRestrictionIri: string): ResourceClassDefinition[] {

        // filter list by the provided IRI to find all subclasses of the provided IRI
        const subclasses = resClasses.filter(
            (resClassDef: ResourceClassDefinition) =>
                resClassDef.subClassOf.indexOf(resClassRestrictionIri) > -1
        );

        // add the filtered list to the list of all subclasses
        this.subClasses = this.subClasses.concat(subclasses);

        // if the provided IRI has subclasses, recursively call this function to find any subclasses of those subclasses
        if (subclasses.length){
            subclasses.forEach((sub) => {
                this._getSubclasses(resClasses, sub.id);
            });
        }

        return this.subClasses;
    }
}
