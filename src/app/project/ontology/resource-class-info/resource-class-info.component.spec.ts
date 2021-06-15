import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { CanDoResponse, ClassDefinition, Constants, MockOntology, OntologiesEndpointV2, ReadOntology } from '@dasch-swiss/dsp-js';
import { DspActionModule, DspApiConfigToken, DspApiConnectionToken, SortingService } from '@dasch-swiss/dsp-ui';
import { of } from 'rxjs';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogHeaderComponent } from 'src/app/main/dialog/dialog-header/dialog-header.component';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { TestConfig } from 'test.config';
import { ResourceClassInfoComponent } from './resource-class-info.component';

/**
 * test host component to simulate parent component
 * Property is of type simple text
 */
@Component({
    template: '<app-resource-class-info #resClassInfo [resourceClass]="resourceClass"></app-resource-class-info>'
})
class HostComponent implements OnInit {

    @ViewChild('resClassInfo') resourceClassInfoComponent: ResourceClassInfoComponent;

    // get ontology from DSP-JS-Lib test data
    ontology: ReadOntology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');

    resourceClass: ClassDefinition;

    constructor(
        private _sortingService: SortingService
    ) { }

    ngOnInit() {

        const allOntoClasses = this.ontology.getAllClassDefinitions();
        // reset the ontology classes
        let classesToDisplay = [];

        // display only the classes which are not a subClass of Standoff
        allOntoClasses.forEach(resClass => {
            if (resClass.subClassOf.length) {
                const splittedSubClass = resClass.subClassOf[0].split('#');
                if (!splittedSubClass[0].includes(Constants.StandoffOntology) && !splittedSubClass[1].includes('Standoff')) {
                    classesToDisplay.push(resClass);
                }
            }
        });
        classesToDisplay = this._sortingService.keySortByAlphabetical(classesToDisplay, 'label');
        this.resourceClass = classesToDisplay[0];
    }

}

describe('ResourceClassInfoComponent', () => {
    let hostComponent: HostComponent;
    let hostFixture: ComponentFixture<HostComponent>;

    beforeEach(waitForAsync(() => {

        const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get']);

        const ontologyEndpointSpyObj = {
            v2: {
                onto: jasmine.createSpyObj('onto', ['getOntology', 'replaceGuiOrderOfCardinalities', 'canDeleteResourceClass'])
            }
        };

        TestBed.configureTestingModule({
            declarations: [
                DialogComponent,
                DialogHeaderComponent,
                HostComponent,
                ResourceClassInfoComponent
            ],
            imports: [
                DspActionModule,
                MatCardModule,
                MatDialogModule,
                MatIconModule,
                MatMenuModule,
                MatTooltipModule
            ],
            providers: [
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: ontologyEndpointSpyObj
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {}
                },
                {
                    provide: MatDialogRef,
                    useValue: {}
                },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        // mock cache service for currentOntology
        const cacheSpy = TestBed.inject(CacheService);

        (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(
            () => {
                const response: ReadOntology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');
                return of(response);
            }
        );

        hostFixture = TestBed.createComponent(HostComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();

        expect(hostComponent).toBeTruthy();
    });

    // beforeEach(inject([DspApiConnectionToken], (knoraApiConn) => {
    //     canBeDeletedSpy = spyOn(knoraApiConn.v2.onto, 'canDeleteResourceClass').and.callFake(
    //         () => {}
    //     );
    // }));

    beforeEach(() => {

        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).canDeleteResourceClass.and.callFake(
            () => {
                const deleteResClass: CanDoResponse = {
                    'canDo': false
                };

                return of(deleteResClass);
            }
        );

        hostFixture = TestBed.createComponent(HostComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();

        expect(hostComponent).toBeTruthy();
    });

    it('expect title to be "Blue thing" and subclass of "Thing"', () => {
        expect(hostComponent.resourceClassInfoComponent).toBeTruthy();
        expect(hostComponent.resourceClassInfoComponent.resourceClass).toBeDefined();

        const hostCompDe = hostFixture.debugElement;

        const title: DebugElement = hostCompDe.query(By.css('mat-card-title'));

        expect(title.nativeElement.innerText).toEqual('Blue thing');

        const subtitle: DebugElement = hostCompDe.query(By.css('mat-card-subtitle'));

        expect(subtitle.nativeElement.innerText).toEqual('Thing');
    });
});
