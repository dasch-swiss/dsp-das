import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  CanDoResponse,
  ClassDefinition,
  Constants,
  MockOntology,
  OntologiesEndpointV2,
  ReadOntology,
} from '@dasch-swiss/dsp-js';
import { SplitPipe } from '@dasch-swiss/vre/shared/app-common-to-move';
import { AppConfigService, DspApiConfigToken, DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppLoggingService } from '@dasch-swiss/vre/shared/app-logging';
import { ApplicationStateService } from '@dasch-swiss/vre/shared/app-state-service';
import { TruncatePipe } from '@dsp-app/src/app/main/pipes/string-transformation/truncate.pipe';
import { SortingService } from '@dsp-app/src/app/main/services/sorting.service';
import { TestConfig } from '@dsp-app/src/test.config';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { ResourceClassInfoComponent } from './resource-class-info.component';

/**
 * test host component to simulate parent component
 * Property is of type simple text
 */
@Component({
  template:
    '<app-resource-class-info #resClassInfo [resourceClass]="resourceClass" [projectStatus]="true" [userCanEdit]="userCanEdit"></app-resource-class-info>',
})
class HostComponent implements OnInit {
  @ViewChild('resClassInfo')
  resourceClassInfoComponent: ResourceClassInfoComponent;

  // get ontology from DSP-JS-Lib test data
  ontology: ReadOntology;

  resourceClass: ClassDefinition;

  userCanEdit: boolean;

  constructor(
    private _applicationStateService: ApplicationStateService,
    private _sortingService: SortingService
  ) {}

  ngOnInit() {
    this._applicationStateService.get('currentOntology').subscribe((response: ReadOntology) => {
      this.ontology = response;

      const allOntoClasses = response.getAllClassDefinitions();
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
    });

    this.userCanEdit = true;
  }
}

describe('ResourceClassInfoComponent', () => {
  let hostComponent: HostComponent;
  let hostFixture: ComponentFixture<HostComponent>;

  beforeEach(waitForAsync(() => {
    const ontologyEndpointSpyObj = {
      v2: {
        onto: jasmine.createSpyObj('onto', [
          'replaceGuiOrderOfCardinalities',
          'canDeleteResourceClass',
          'canReplaceCardinalityOfResourceClass',
        ]),
      },
    };

    const applicationStateServiceSpy = jasmine.createSpyObj('ApplicationStateService', ['get']);

    TestBed.configureTestingModule({
      declarations: [HostComponent, ResourceClassInfoComponent, SplitPipe, TruncatePipe],
      imports: [
        BrowserAnimationsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatSnackBarModule,
        MatTooltipModule,
      ],
      providers: [
        AppConfigService,
        MockProvider(AppLoggingService),
        {
          provide: DspApiConfigToken,
          useValue: TestConfig.ApiConfig,
        },
        {
          provide: DspApiConnectionToken,
          useValue: ontologyEndpointSpyObj,
        },
        {
          provide: ApplicationStateService,
          useValue: applicationStateServiceSpy,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // mock application state service for currentOntology
    const cacheSpyOnto = TestBed.inject(ApplicationStateService);
    (cacheSpyOnto as jasmine.SpyObj<ApplicationStateService>).get.withArgs('currentOntology').and.callFake(() => {
      const response: ReadOntology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');
      return of(response);
    });

    const cacheSpyProjOnto = TestBed.inject(ApplicationStateService);
    (cacheSpyProjOnto as jasmine.SpyObj<ApplicationStateService>).get
      .withArgs('currentProjectOntologies')
      .and.callFake(() => {
        const ontologies: ReadOntology[] = [];
        ontologies.push(MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2'));
        ontologies.push(MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/minimal/v2'));
        const response: ReadOntology[] = ontologies;
        return of(response);
      });

    const dspConnSpy = TestBed.inject(DspApiConnectionToken);

    (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).canDeleteResourceClass.and.callFake(() => {
      const deleteResClass: CanDoResponse = {
        canDo: false,
      };

      return of(deleteResClass);
    });

    (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).canReplaceCardinalityOfResourceClass.and.callFake(
      () => {
        const replaceCardinalityOfResClass: CanDoResponse = {
          canDo: false,
        };

        return of(replaceCardinalityOfResClass);
      }
    );

    hostFixture = TestBed.createComponent(HostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();

    expect(hostComponent).toBeTruthy();
  });

  it('expect title to be "Audio Sequence Thing", id name "AudioSequenceThing" and subclass of "Thing"', () => {
    expect(hostComponent.resourceClassInfoComponent).toBeTruthy();
    expect(hostComponent.resourceClassInfoComponent.resourceClass).toBeDefined();

    const hostCompDe = hostFixture.debugElement;

    const title: DebugElement = hostCompDe.query(By.css('mat-card-title'));

    expect(title.nativeElement.innerText).toEqual('Audio Sequence Thing');

    const subtitle: DebugElement = hostCompDe.query(By.css('mat-card-subtitle'));

    expect(subtitle.nativeElement.innerText).toContain('AudioSequenceThing');
    expect(subtitle.nativeElement.innerText).toContain('Thing');
  });

  it('expect delete res class button should be disabled', () => {
    expect(hostComponent.resourceClassInfoComponent).toBeTruthy();
    expect(hostComponent.resourceClassInfoComponent.resourceClass).toBeDefined();

    const hostCompDe = hostFixture.debugElement;

    const moreBtn: DebugElement = hostCompDe.query(By.css('.res-class-menu'));
    moreBtn.nativeElement.click();

    const deleteBtn: DebugElement = hostCompDe.query(By.css('.res-class-delete'));
    expect(deleteBtn.nativeElement.disabled).toBeTruthy();
  });
});
