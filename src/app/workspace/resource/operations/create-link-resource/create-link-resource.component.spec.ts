import { Component, DebugElement, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    CreateIntValue,
    CreateResource,
    CreateTextValueAsString,
    CreateValue,
    MockOntology,
    MockResource,
    ReadResource,
    ResourceClassAndPropertyDefinitions,
    ResourceClassDefinition,
    ResourcePropertyDefinition,
    ResourcesEndpointV2
} from '@dasch-swiss/dsp-js';
import { OntologyCache } from '@dasch-swiss/dsp-js/src/cache/ontology-cache/OntologyCache';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { BaseValueDirective } from 'src/app/main/directive/base-value.directive';
import { SwitchPropertiesComponent } from '../../resource-instance-form/select-properties/switch-properties/switch-properties.component';
import { ValueService } from '../../services/value.service';
import { IntValueComponent } from '../../values/int-value/int-value.component';
import { TextValueAsStringComponent } from '../../values/text-value/text-value-as-string/text-value-as-string.component';

import { CreateLinkResourceComponent } from './create-link-resource.component';

/**
 * test host component to simulate parent component.
 */
@Component({
    template: `
        <app-create-link-resource [parentResource]="parentResource" [propDef]="propDef" [resourceClassDef]="resourceClassDef" #createLinkResourceComp></app-create-link-resource>`
})
class TestHostComponent implements OnInit {

    @ViewChild('createLinkResourceComp') createLinkResourceComponent: CreateLinkResourceComponent;

    parentResource: ReadResource;
    propDef: string;
    resourceClassDef: string;

    ngOnInit() {
        MockResource.getTestThing().subscribe(res => {
            this.parentResource = res;
            this.propDef = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasOtherThingValue';
            this.resourceClassDef = 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing';
        });
    }

}

/**
 * mock select-properties component to use in tests.
 */
@Component({
    selector: 'app-select-properties',
    template: `
        <app-text-value-as-string #createVal
            [mode]="'create'"
            [commentDisabled]="true"
            [valueRequiredValidator]="true"
            [parentForm]="parentForm"
            [formName]="'label'">
        </app-text-value-as-string>
    `
})
class MockSelectPropertiesComponent {
    @ViewChildren('switchProp') switchPropertiesComponent: QueryList<SwitchPropertiesComponent>;

    // input for resource's label
    @ViewChild('createVal') createValueComponent: BaseValueDirective;

    @Input() properties: ResourcePropertyDefinition[];

    @Input() ontologyInfo: ResourceClassAndPropertyDefinitions;

    @Input() resourceClass: ResourceClassDefinition;

    @Input() parentForm: FormGroup;

    parentResource = new ReadResource();

    constructor(private _valueService: ValueService) { }
}

/**
 * mock switch-properties component to use in tests.
 */
@Component({
    selector: 'app-switch-properties'
})
class MockSwitchPropertiesComponent {
    @ViewChild('createVal') createValueComponent: BaseValueDirective;

    @Input() property: ResourcePropertyDefinition;

    @Input() parentResource: ReadResource;

    @Input() parentForm: FormGroup;

    @Input() formName: string;
}

/**
 * mock value component to use in tests.
 */
@Component({
    selector: 'dsp-int-value'
})
class MockCreateIntValueComponent implements OnInit {

    @ViewChild('createVal') createValueComponent: IntValueComponent;

    @Input() parentForm: FormGroup;

    @Input() formName: string;

    @Input() mode;

    @Input() displayValue;

    form: FormGroup;

    valueFormControl: FormControl;

    constructor(@Inject(FormBuilder) private _fb: FormBuilder) { }

    ngOnInit(): void {
        this.valueFormControl = new FormControl(null, [Validators.required]);

        this.form = this._fb.group({
            test: this.valueFormControl
        });
    }

    getNewValue(): CreateValue {
        const createIntVal = new CreateIntValue();

        createIntVal.int = 123;

        return createIntVal;
    }

    updateCommentVisibility(): void { }
}

/**
 * mock value component to use in tests.
 */
@Component({
    selector: 'app-text-value-as-string'
})
class MockCreateTextValueComponent implements OnInit {

    @ViewChild('createVal') createValueComponent: TextValueAsStringComponent;

    @Input() parentForm: FormGroup;

    @Input() formName: string;

    @Input() mode;

    @Input() displayValue;

    @Input() commentDisabled?: boolean;

    @Input() valueRequiredValidator: boolean;

    form: FormGroup;

    valueFormControl: FormControl;
    constructor(@Inject(FormBuilder) private _fb: FormBuilder) { }
    ngOnInit(): void {
        this.valueFormControl = new FormControl(null, [Validators.required]);
        this.form = this._fb.group({
            label: this.valueFormControl
        });
    }
    getNewValue(): CreateValue {
        const createTextVal = new CreateTextValueAsString();
        createTextVal.text = 'My Label';
        return createTextVal;
    }
    updateCommentVisibility(): void { }
}

describe('CreateLinkResourceComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;
    let createLinkResourceComponentDe: DebugElement;

    beforeEach(waitForAsync(() => {

        const dspConnSpy = {
            v2: {
                ontologyCache: jasmine.createSpyObj('ontologyCache', ['getOntology', 'getResourceClassDefinition']),
                res: jasmine.createSpyObj('res', ['createResource'])
            }
        };

        TestBed.configureTestingModule({
            declarations: [
                CreateLinkResourceComponent,
                TestHostComponent,
                MockSelectPropertiesComponent,
                MockCreateTextValueComponent,
                MockSwitchPropertiesComponent,
                MockCreateIntValueComponent
            ],
            imports: [
                BrowserAnimationsModule,
                MatButtonModule,
                MatDialogModule,
                MatFormFieldModule,
                MatSnackBarModule,
                ReactiveFormsModule,
                TranslateModule.forRoot()
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpy
                },
                ValueService
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.v2.ontologyCache as jasmine.SpyObj<OntologyCache>).getResourceClassDefinition.and.callFake(
            (resClassIri: string) => of(MockOntology.mockIResourceClassAndPropertyDefinitions('http://0.0.0.0:3333/ontology/0001/anything/v2#Thing'))
        );

        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
        expect(testHostComponent).toBeTruthy();

        const hostCompDe = testHostFixture.debugElement;

        createLinkResourceComponentDe = hostCompDe.query(By.directive(CreateLinkResourceComponent));

    });

    it('should initialize the properties array', async () => {
        expect(testHostComponent.createLinkResourceComponent.properties.length).toEqual(18);
    });

    it('should submit the form', () => {
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).createResource.and.callFake(
            () => {
                let resource = new ReadResource();

                MockResource.getTestThing().subscribe((res) => {
                    resource = res;
                });

                return of(resource);
            }
        );

        const anythingOnto = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');

        // get resource class definitions
        const resourceClasses = anythingOnto.getClassDefinitionsByType(ResourceClassDefinition);

        testHostComponent.createLinkResourceComponent.properties = new Array<ResourcePropertyDefinition>();

        MockResource.getTestThing().subscribe(res => {
            const resourcePropDef = (res.entityInfo as ResourceClassAndPropertyDefinitions).getAllPropertyDefinitions()[9];
            testHostComponent.createLinkResourceComponent.properties.push(resourcePropDef as ResourcePropertyDefinition);
        });

        testHostFixture.detectChanges();

        const selectPropertiesComp = createLinkResourceComponentDe.query(By.directive(MockSelectPropertiesComponent));

        expect(selectPropertiesComp).toBeTruthy();

        const label = new CreateTextValueAsString();
        label.text = 'My Label';

        const props = {};
        const createVal = new CreateIntValue();
        createVal.int = 123;
        props['http://0.0.0.0:3333/ontology/0001/anything/v2#hasInteger'] = [createVal];

        const expectedCreateResource = new CreateResource();
        expectedCreateResource.label = 'My Label';
        expectedCreateResource.type = 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing';
        expectedCreateResource.properties = props;

        testHostComponent.createLinkResourceComponent.onSubmit();

        expect(dspConnSpy.v2.res.createResource).toHaveBeenCalledTimes(1);
    });
});
