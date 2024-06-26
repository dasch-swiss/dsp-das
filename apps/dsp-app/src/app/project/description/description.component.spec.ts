import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, DebugElement, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ApiResponseData,
  MockProjects,
  ProjectResponse,
  ProjectsEndpointAdmin,
  ReadProject,
  StringLiteral,
} from '@dasch-swiss/dsp-js';
import { DialogComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { AppConfigService, DspApiConfigToken, DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppLoggingService } from '@dasch-swiss/vre/shared/app-logging';
import { ApplicationStateService } from '@dasch-swiss/vre/shared/app-state-service';
import { StatusComponent } from '@dsp-app/src/app/main/status/status.component';
import { TestConfig } from '@dsp-app/src/test.config';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { DescriptionComponent } from './description.component';

@Component({
  template: '<app-description #description></app-description>',
})
class TestHostDescriptionComponent {
  @ViewChild('description') descriptionComp: DescriptionComponent;
}

/**
 * test component that mocks StringLiteralInputComponent
 */
@Component({ selector: 'app-string-literal-input', template: '' })
class MockStringLiteralInputComponent {
  @Input() placeholder = 'Label';
  @Input() language: string;
  @Input() textarea: boolean;
  @Input() value: StringLiteral[] = [];
  @Input() disabled: boolean;
  @Input() readonly: boolean;

  constructor() {}
}

/**
 * test component that mocks StringLiteralInputComponent
 */
@Component({ selector: 'app-project-form', template: '' })
class MockProjectFormComponent {
  @Input() projectIri: string;

  constructor() {}
}

describe('DescriptionComponent', () => {
  let testHostComponent: TestHostDescriptionComponent;
  let testHostFixture: ComponentFixture<TestHostDescriptionComponent>;
  let descriptionComponentDe: DebugElement;
  let rootLoader: HarnessLoader;

  beforeEach(waitForAsync(() => {
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['iriToUuid']);

    const dspConnSpy = {
      admin: {
        projectsEndpoint: jasmine.createSpyObj('projectsEndpoint', ['getProjectByShortcode']),
      },
    };

    const applicationStateServiceSpy = jasmine.createSpyObj('ApplicationStateService', ['get']);

    TestBed.configureTestingModule({
      declarations: [
        DescriptionComponent,
        TestHostDescriptionComponent,
        MockStringLiteralInputComponent,
        MockProjectFormComponent,
        DialogComponent,
        StatusComponent,
      ],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatChipsModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              paramMap: of({
                get: (param: string) => {
                  if (param === 'uuid') {
                    return TestConfig.ProjectUuid;
                  }
                },
              }),
              snapshot: {
                url: [{ path: 'project' }],
              },
            },
          },
        },
        AppConfigService,
        MockProvider(AppLoggingService),
        {
          provide: DspApiConfigToken,
          useValue: TestConfig.ApiConfig,
        },
        {
          provide: DspApiConnectionToken,
          useValue: dspConnSpy,
        },
        {
          provide: ProjectService,
          useValue: projectServiceSpy,
        },
        {
          provide: ApplicationStateService,
          useValue: applicationStateServiceSpy,
        },
      ],
    }).compileComponents();
  }));

  // mock localStorage
  beforeEach(() => {
    let store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string): string => store[key] || null);
    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): string => (store[key] = <any>value));
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  beforeEach(() => {
    localStorage.setItem('session', JSON.stringify(TestConfig.CurrentSession));

    // mock application state service
    const cacheSpy = TestBed.inject(ApplicationStateService);

    (cacheSpy as jasmine.SpyObj<ApplicationStateService>).get.and.callFake(() => {
      const response: ProjectResponse = new ProjectResponse();

      const mockProjects = MockProjects.mockProjects();

      response.project = mockProjects.body.projects[0];

      return of(response.project as ReadProject);
    });

    const dspConnSpy = TestBed.inject(DspApiConnectionToken);

    (dspConnSpy.admin.projectsEndpoint as jasmine.SpyObj<ProjectsEndpointAdmin>).getProjectByShortcode.and.callFake(
      () => {
        const response = new ProjectResponse();

        const mockProjects = MockProjects.mockProjects();

        response.project = mockProjects.body.projects[0];

        return of(ApiResponseData.fromAjaxResponse({ response } as AjaxResponse));
      }
    );

    testHostFixture = TestBed.createComponent(TestHostDescriptionComponent);
    testHostComponent = testHostFixture.componentInstance;
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(testHostFixture);
    testHostFixture.detectChanges();

    expect(testHostComponent).toBeTruthy();

    const hostCompDe = testHostFixture.debugElement;
    descriptionComponentDe = hostCompDe.query(By.directive(DescriptionComponent));
    expect(descriptionComponentDe).toBeTruthy();
  });

  it('should get the session', () => {
    expect<any>(localStorage.getItem('session')).toBe(JSON.stringify(TestConfig.CurrentSession));
  });

  it('should display the description in read mode', () => {
    const desc = descriptionComponentDe.query(By.css('.description-rm'));
    expect(desc).toBeTruthy();
  });

  it('should not display the edit button as a regular user', async () => {
    testHostComponent.descriptionComp.userHasPermission = false;

    testHostFixture.detectChanges();

    const editBtn = await rootLoader.getAllHarnesses(MatButtonHarness.with({ selector: '.app-toolbar-action button' }));

    expect(editBtn.length).toEqual(0);
  });

  it('should display the edit button as an admin', async () => {
    testHostComponent.descriptionComp.userHasPermission = true;

    testHostFixture.detectChanges();

    const editBtn = await rootLoader.getHarness(MatButtonHarness.with({ selector: '.app-toolbar-action button' }));

    expect(editBtn).toBeTruthy();
  });

  // todo: check the project name, if there is description and keywords, check if we can edit the project info if the user is project admin or system admin (edit btn displayed)
  // check if you get the project by shortcode
  // check if you get the project metadata
});
