import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateStillImageFileValue } from '@dasch-swiss/dsp-js';
import { SplitPipe } from '@dasch-swiss/vre/shared/app-common-to-move';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { UploadFileService } from '@dasch-swiss/vre/shared/app-representations';
import { of } from 'rxjs';
import { UploadComponent } from './upload.component';

/**
 * test host component to simulate parent component.
 */
@Component({
  template: ` <app-upload #upload [representation]="representation" [parentForm]="form"></app-upload>`,
})
class TestHostComponent implements OnInit {
  @ViewChild('upload') uploadComp: UploadComponent;

  representation = 'stillImage';

  form: UntypedFormGroup;

  constructor(private _fb: UntypedFormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({});
  }
}

describe('UploadComponent', () => {
  const mockFile = new File(['1'], 'testfile.jpg', { type: 'image/jpeg' });

  const fb = new UntypedFormBuilder();

  let testHostComponent: TestHostComponent;
  let testHostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(waitForAsync(() => {
    const uploadServiceSpy = jasmine.createSpyObj('UploadFileService', ['upload']);
    const notificationServiceMock = jasmine.createSpyObj('NotificationService', ['openSnackBar']);
    const errorHandlerMock = jasmine.createSpyObj('AppErrorHandler', ['handleError']);

    TestBed.configureTestingModule({
      declarations: [UploadComponent, TestHostComponent, SplitPipe],
      imports: [MatDialogModule, MatInputModule, MatSnackBarModule, ReactiveFormsModule, MatIconModule],
      providers: [
        {
          provide: UploadFileService,
          useValue: uploadServiceSpy,
        },
        {
          provide: NotificationService,
          useValue: notificationServiceMock,
        },
        {
          provide: AppErrorHandler,
          useValue: errorHandlerMock,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = testHostFixture.componentInstance;
    testHostFixture.detectChanges();
  });

  it('should create', () => {
    expect(testHostComponent).toBeTruthy();
    expect(testHostComponent.uploadComp).toBeTruthy();
  });

  it('should display file type', () => {
    expect(testHostComponent.uploadComp.representation).toBeDefined();
  });

  it('should be created without a file', () => {
    expect(testHostComponent.uploadComp.file).toBeFalsy();
  });

  it('should delete attachment', () => {
    testHostComponent.uploadComp.file = mockFile;
    testHostComponent.uploadComp.fileControl.setValue(mockFile);
    testHostComponent.uploadComp.thumbnailUrl = 'test';
    testHostComponent.uploadComp.deleteAttachment();
    expect(testHostComponent.uploadComp.file).toBeNull();
    expect(testHostComponent.uploadComp.fileControl.value).toBeNull();
    expect(testHostComponent.uploadComp.thumbnailUrl).toBeNull();
  });

  describe('form', () => {
    it('should create form group and file control and add it to the parent form', waitForAsync(() => {
      testHostFixture.whenStable().then(() => {
        expect(testHostComponent.uploadComp.form).toBeDefined();
        expect(testHostComponent.uploadComp.fileControl).toBeTruthy();

        // check that the form control has been added to the parent form
        expect(testHostComponent.form.contains('file')).toBe(true);
      });
    }));

    it('should reset the form', () => {
      testHostComponent.uploadComp.form = fb.group({ test: '' });
      expect(testHostComponent.uploadComp.form.get('test').value).toBeNull();
    });
  });

  describe('isFileTypeSupported', () => {
    it('should return true for the supported image files', () => {
      let fileTypes = ['jpg', 'jpeg', 'jp2', 'tiff', 'tif', 'png'];
      const fileTypeVariations = ['Jpg', 'jPg', 'jpG', 'JPG']; // edge case for strangely formated file extensions that are supported

      fileTypes = fileTypes.concat(fileTypeVariations);

      for (const type of fileTypes) {
        expect(testHostComponent.uploadComp['_isFileTypeSupported'](type)).toBeTruthy();
      }
    });

    it('should return false for unsupported image files', () => {
      const fileTypes = ['gif', 'bmp', 'psd', 'raw', 'pdf', 'eps', 'ai', 'indd'];
      for (const type of fileTypes) {
        expect(testHostComponent.uploadComp['_isFileTypeSupported'](type)).toBeFalsy();
      }
    });
  });

  describe('isMoreThanOneFile', () => {
    it('should return false for one file array', () => {
      const filesArray: File[] = [];
      filesArray.push(mockFile);
      expect(testHostComponent.uploadComp['_isMoreThanOneFile'](filesArray)).toBeFalsy();
    });

    it('should return false for more than one file', () => {
      const filesArray: File[] = [];
      filesArray.push(mockFile, mockFile, mockFile);
      expect(testHostComponent.uploadComp['_isMoreThanOneFile'](filesArray)).toBeTruthy();
    });
  });

  describe('addFile', () => {
    it('should make a request to Sipi when a file is added', () => {
      expect(testHostComponent.uploadComp.form.valid).toBe(false);

      const uploadService = TestBed.inject(UploadFileService) as jasmine.SpyObj<UploadFileService>;

      uploadService.upload.and.returnValue(
        of({
          uploadedFiles: [
            {
              fileType: 'image',
              temporaryUrl: 'http://localhost:1024/tmp/8oDdefPSkaz-EG187srxBFZ.jp2',
              originalFilename: 'beaver.jpg',
              internalFilename: '8oDdefPSkaz-EG187srxBFZ.jp2',
            },
          ],
        })
      );

      // https://stackoverflow.com/questions/57080760/fake-file-drop-event-for-unit-testing
      const drop = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: { files: [mockFile] },
      };

      testHostComponent.uploadComp.addFile(drop);

      expect(testHostComponent.uploadComp.form.valid).toBe(true);

      const createFileVal = testHostComponent.uploadComp.getNewValue();

      expect(createFileVal instanceof CreateStillImageFileValue).toBe(true);
      expect((createFileVal as CreateStillImageFileValue).filename).toEqual('8oDdefPSkaz-EG187srxBFZ.jp2');

      const expectedFormData = new FormData();
      expectedFormData.append(mockFile.name, mockFile);

      expect(uploadService.upload).toHaveBeenCalledTimes(1);
      expect(uploadService.upload).toHaveBeenCalledWith(expectedFormData);
    });
  });
});
