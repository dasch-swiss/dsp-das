import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { AdminAPIApiService, ProjectLicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { LicensesEnabledTableComponent } from './licenses-enabled-table.component';

describe('LicensesEnabledTableComponent - Optimistic Updates', () => {
  let component: LicensesEnabledTableComponent;
  let fixture: ComponentFixture<LicensesEnabledTableComponent>;
  let mockAdminApiService: jest.Mocked<AdminAPIApiService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

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

    mockNotificationService = {
      openSnackBar: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [LicensesEnabledTableComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: AdminAPIApiService, useValue: mockAdminApiService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LicensesEnabledTableComponent);
    component = fixture.componentInstance;
    component.project = mockProject;
    component.licenses = [...mockLicenses];
  });

  describe('onLicenseToggle', () => {
    it('should create new license array without mutating input when checkbox is checked', () => {
      const originalLicenses = component.licenses;
      const license = component.licenses[0];
      const event = {
        checked: true,
      } as MatCheckboxChange;

      expect(license.isEnabled).toBe(false);

      component.onLicenseToggle(event, license.id);

      // Should create new array reference
      expect(component.licenses).not.toBe(originalLicenses);
      // Updated license should have new state
      const updatedLicense = component.licenses.find(l => l.id === license.id);
      expect(updatedLicense?.isEnabled).toBe(true);
      // Original license object should remain unchanged
      expect(license.isEnabled).toBe(false);
    });

    it('should create new license array without mutating input when checkbox is unchecked', () => {
      const originalLicenses = component.licenses;
      const license = component.licenses[1];
      const event = {
        checked: false,
      } as MatCheckboxChange;

      expect(license.isEnabled).toBe(true);

      component.onLicenseToggle(event, license.id);

      // Should create new array reference
      expect(component.licenses).not.toBe(originalLicenses);
      // Updated license should have new state
      const updatedLicense = component.licenses.find(l => l.id === license.id);
      expect(updatedLicense?.isEnabled).toBe(false);
      // Original license object should remain unchanged
      expect(license.isEnabled).toBe(true);
    });

    it('should trigger change detection after optimistic update', () => {
      const license = component.licenses[0];
      const event = {
        checked: true,
      } as MatCheckboxChange;
      const cdrSpy = jest.spyOn(component['_cdr'], 'markForCheck');

      component.onLicenseToggle(event, license.id);

      expect(cdrSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should show notification and refresh on enable API error', () => {
      mockAdminApiService.putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriEnable.mockReturnValue(
        throwError(() => new Error('API Error'))
      );
      const refreshSpy = jest.spyOn(component.refresh, 'emit');

      component.enable('http://creativecommons.org/licenses/by/4.0/');

      expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith('Failed to enable license. Please try again.');
      expect(refreshSpy).toHaveBeenCalled();
    });

    it('should show notification and refresh on disable API error', () => {
      mockAdminApiService.putAdminProjectsShortcodeProjectshortcodeLegalInfoLicensesLicenseiriDisable.mockReturnValue(
        throwError(() => new Error('API Error'))
      );
      const refreshSpy = jest.spyOn(component.refresh, 'emit');

      component.disable('http://creativecommons.org/licenses/by-sa/4.0/');

      expect(mockNotificationService.openSnackBar).toHaveBeenCalledWith('Failed to disable license. Please try again.');
      expect(refreshSpy).toHaveBeenCalled();
    });

    it('should not emit refresh or show notification on successful API call', () => {
      const refreshSpy = jest.spyOn(component.refresh, 'emit');

      component.enable('http://creativecommons.org/licenses/by/4.0/');

      expect(refreshSpy).not.toHaveBeenCalled();
      expect(mockNotificationService.openSnackBar).not.toHaveBeenCalled();
    });
  });
});
