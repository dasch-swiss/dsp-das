import { OverlayContainer } from '@angular/cdk/overlay';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, Input, OnInit } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockResource, ReadIntValue, ReadValue } from '@dasch-swiss/dsp-js';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogValueDeletionPayload,
} from './confirmation-dialog.component';

/**
 * test host component to simulate parent component with a confirmation dialog.
 */
@Component({
  template: ` <p>{{ confirmationDialogResponse }}</p>`,
})
class ConfirmationDialogTestHostComponent implements OnInit {
  confirmationDialogResponse: string;

  testValue: ReadIntValue;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    MockResource.getTestThing().subscribe(res => {
      this.testValue = res.getValuesAs(
        'http://0.0.0.0:3333/ontology/0001/anything/v2#hasInteger',
        ReadIntValue
      )[0];
    });
  }

  openDialog() {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          value: this.testValue,
          buttonTextOk: 'OK',
          buttonTextCancel: 'Cancel',
        },
      })
      .afterClosed()
      .subscribe((payload: ConfirmationDialogValueDeletionPayload) => {
        if (payload && payload.confirmed) {
          this.confirmationDialogResponse = 'Action was confirmed!';
        } else {
          this.confirmationDialogResponse = 'Action was cancelled';
        }
      });
  }
}

@Component({ selector: 'app-confirmation-message', template: '' })
class MockConfirmationMessageComponent {
  @Input() value: ReadValue;

  constructor() {}
}

describe('ConfirmationDialogComponent', () => {
  let testHostComponent: ConfirmationDialogTestHostComponent;
  let testHostFixture: ComponentFixture<ConfirmationDialogTestHostComponent>;
  let rootLoader: HarnessLoader;
  let overlayContainer: OverlayContainer;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConfirmationDialogComponent,
        ConfirmationDialogTestHostComponent,
        MockConfirmationMessageComponent,
      ],
      imports: [MatDialogModule, BrowserAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
      ],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(
      ConfirmationDialogTestHostComponent
    );
    testHostComponent = testHostFixture.componentInstance;
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(testHostFixture);
    testHostFixture.detectChanges();
    expect(testHostComponent).toBeTruthy();
  });

  it('should display a confirmation dialog', async () => {
    testHostComponent.openDialog();

    testHostFixture.detectChanges();

    await testHostFixture.whenStable();

    const dialogDiv = document.querySelector('mat-dialog-container');
    expect(dialogDiv).toBeTruthy();

    const dspConfirmMsg = document.querySelector('app-confirmation-message');
    expect(dspConfirmMsg).toBeTruthy();

    const dialogTitle = dialogDiv.querySelector('.title');
    expect(dialogTitle.innerHTML.trim()).toEqual(
      'Are you sure you want to delete this value from Integer?'
    );
  });
});
