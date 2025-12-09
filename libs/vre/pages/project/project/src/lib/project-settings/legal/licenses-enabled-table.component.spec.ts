import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { AdminAPIApiService, ProjectLicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { LicensesEnabledTableComponent } from './licenses-enabled-table.component';

describe('LicensesEnabledTableComponent - Optimistic Updates', () => {
  let component: LicensesEnabledTableComponent;
  let fixture: ComponentFixture<LicensesEnabledTableComponent>;
  let mockAdminApiService: jest.Mocked<AdminAPIApiService>;

  const mockProject = {
    shortcode: '0001',
  } as ReadProject;

  const mockLicenses: ProjectLicenseDto[] = [
    {
      id: 'http://creativecommons.org/licenses/by/4.0/',
      labelEn: 'CC BY 4.0',
      uri: 'http://creativecommons.org/licenses/by/4.0/',
      isEnabled: false,
      isRecommended: true,
    },
    {
      id: 'http://creativecommons.org/licenses/by-sa/4.0/',
      labelEn: 'CC BY-SA 4.0',
      uri: 'http://creativecommons.org/licenses/by-sa/4.0/',
      isEnabled: true,
      isRecommended: true,
    },
  ];

  beforeEach(async () => {
    mockAdminApiService = {
      putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriEnable: jest.fn().mockReturnValue(of({})),
      putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriDisable: jest.fn().mockReturnValue(of({})),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [LicensesEnabledTableComponent],
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: AdminAPIApiService, useValue: mockAdminApiService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LicensesEnabledTableComponent);
    component = fixture.componentInstance;
    component.project = mockProject;
    component.licenses = [...mockLicenses];
  });

  describe('onLicenseToggle', () => {
    it('should immediately update local state when checkbox is checked', () => {
      const license = component.licenses[0];
      const event = {
        checked: true,
      } as MatCheckboxChange;

      expect(license.isEnabled).toBe(false);

      component.onLicenseToggle(event, license.id);

      expect(license.isEnabled).toBe(true);
    });

    it('should immediately update local state when checkbox is unchecked', () => {
      const license = component.licenses[1];
      const event = {
        checked: false,
      } as MatCheckboxChange;

      expect(license.isEnabled).toBe(true);

      component.onLicenseToggle(event, license.id);

      expect(license.isEnabled).toBe(false);
    });
  });

  describe('enable', () => {
    it('should not emit refresh on successful API call', () => {
      const refreshSpy = jest.spyOn(component.refresh, 'emit');

      component.enable('http://creativecommons.org/licenses/by/4.0/');

      expect(refreshSpy).not.toHaveBeenCalled();
    });

    it('should emit refresh on API error to revert optimistic update', () => {
      mockAdminApiService.putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriEnable.mockReturnValue(
        throwError(() => new Error('API Error'))
      );
      const refreshSpy = jest.spyOn(component.refresh, 'emit');

      component.enable('http://creativecommons.org/licenses/by/4.0/');

      expect(refreshSpy).toHaveBeenCalled();
    });
  });

  describe('disable', () => {
    it('should emit refresh on API error to revert optimistic update', () => {
      mockAdminApiService.putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriDisable.mockReturnValue(
        throwError(() => new Error('API Error'))
      );
      const refreshSpy = jest.spyOn(component.refresh, 'emit');

      component.disable('http://creativecommons.org/licenses/by-sa/4.0/');

      expect(refreshSpy).toHaveBeenCalled();
    });
  });
});
