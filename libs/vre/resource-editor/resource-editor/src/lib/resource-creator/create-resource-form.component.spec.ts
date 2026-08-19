import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectDataRights, ProjectDataRightsService } from '@dasch-swiss/vre/shared/app-helper-services';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CreateResourceFormComponent } from './create-resource-form.component';

describe('CreateResourceFormComponent', () => {
  let component: CreateResourceFormComponent;
  let fixture: ComponentFixture<CreateResourceFormComponent>;
  let mockDspApiConnection: jest.Mocked<KnoraApiConnection>;

  beforeEach(async () => {
    mockDspApiConnection = {
      v2: {
        ontologyCache: {
          reloadCachedItem: jest.fn().mockReturnValue(of({})),
          getResourceClassDefinition: jest.fn().mockReturnValue(
            of({
              classes: {
                'http://test.org/TestClass': {
                  id: 'http://test.org/TestClass',
                  getResourcePropertiesList: jest.fn().mockReturnValue([]),
                },
              },
              properties: {},
            })
          ),
        },
        res: {
          createResource: jest.fn().mockReturnValue(of({ id: 'http://test.org/resource/123' })),
        },
      },
    } as any;

    await TestBed.configureTestingModule({
      imports: [CreateResourceFormComponent, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: DspApiConnectionToken, useValue: mockDspApiConnection },
        // The form loads the project's resource-side legal info on init; stub the rights service.
        {
          provide: ProjectDataRightsService,
          useValue: { forProject: jest.fn().mockReturnValue(of({ defaultDataAuthorship: [] })) },
        },
        provideTranslateService(),
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateResourceFormComponent);
    component = fixture.componentInstance;
    component.resourceClassIri = 'http://test.org/TestClass';
    component.projectIri = 'http://test.org/project/123';
    component.projectShortcode = 'test';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Cancel button interaction', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit cancelled event when cancel button is clicked', () => {
      const cancelledSpy = jest.fn();
      component.cancelled.subscribe(cancelledSpy);
      const cancelButton = fixture.nativeElement.querySelector('[data-cy="cancel-button"]');

      cancelButton.click();

      expect(cancelledSpy).toHaveBeenCalledTimes(1);
    });

    it('should prevent form submission with type="button"', () => {
      const cancelButton = fixture.nativeElement.querySelector('[data-cy="cancel-button"]');

      expect(cancelButton.getAttribute('type')).toBe('button');
    });
  });

  describe('submitData', () => {
    it('should not submit if form is invalid', () => {
      component.ngOnInit();
      fixture.detectChanges();

      component.form.controls.label.setValue('');
      component.submitData();

      expect(mockDspApiConnection.v2.res.createResource).not.toHaveBeenCalled();
    });
  });

  describe('resource-side legal info', () => {
    const PLACEHOLDER = 'urn:dasch:placeholder';

    /** Re-stub the rights service before init, since `ngOnInit` is what reads it. */
    const givenProjectRights = (rights: Partial<ProjectDataRights>) => {
      const service = TestBed.inject(ProjectDataRightsService);
      (service.forProject as jest.Mock).mockReturnValue(
        of({
          defaultDataAuthorship: [],
          isPlaceholderLicense: false,
          isPlaceholderCopyrightHolder: false,
          ...rights,
        })
      );
      component.ngOnInit();
    };

    it('should seed the authorship field with the project default', () => {
      givenProjectRights({ defaultDataAuthorship: ['Ada Lovelace'] });

      expect(component.form.controls.resourceAuthorship.value).toEqual(['Ada Lovelace']);
    });

    it('should flag a placeholder license and drop its dead url', () => {
      givenProjectRights({ isPlaceholderLicense: true });

      expect(component.isPlaceholderLicense).toBe(true);
      expect(component.dataLicenseUrl).toBeUndefined();
    });

    it('should flag a placeholder copyright holder rather than showing the raw sentinel', () => {
      givenProjectRights({ copyrightHolder: PLACEHOLDER, isPlaceholderCopyrightHolder: true });

      expect(component.isPlaceholderCopyrightHolder).toBe(true);
    });

    it('should never render the raw sentinel in the locked legal rows', () => {
      givenProjectRights({
        copyrightHolder: PLACEHOLDER,
        isPlaceholderCopyrightHolder: true,
        isPlaceholderLicense: true,
      });
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain(PLACEHOLDER);
      expect(fixture.nativeElement.innerHTML).not.toContain(PLACEHOLDER);
    });
  });
});
