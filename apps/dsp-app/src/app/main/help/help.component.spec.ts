import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DialogComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { AppConfigService, DspApiConfigToken, DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppLoggingService } from '@dasch-swiss/vre/shared/app-logging';
import { TestConfig } from '@dsp-app/src/test.config';
import { MockProvider } from 'ng-mocks';
import { FooterComponent } from '../footer/footer.component';
import { GridComponent } from '../grid/grid.component';
import { StatusComponent } from '../status/status.component';
import { HelpComponent } from './help.component';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  const appInitSpy = {
    dspConfig: {
      environment: 'unit test server',
      release: '2022.02.02',
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HelpComponent, FooterComponent, GridComponent, DialogComponent, StatusComponent],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatSnackBarModule,
        RouterTestingModule,
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
          useValue: new KnoraApiConnection(TestConfig.ApiConfig),
        },
        {
          provide: AppConfigService,
          useValue: appInitSpy,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a mailto href incl. subject', () => {
    // get the support section and find the contact-us button
    const hostCompDe = fixture.debugElement;
    const section = hostCompDe.query(By.css('.support'));

    const grid = section.query(By.directive(GridComponent));
    const button = grid.query(By.css('.mailto'));
    const href = button.nativeElement.href;

    expect(href).toEqual(
      'mailto:support@dasch.swiss?subject=DSP-APP%20request%20|%20unit%20test%20server:%202022.02.02'
    );
  });

  // all other buttons have been tested in e2e tests => see e2e/src/help.e2e-spec.ts
});
