import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import {
    AppInitService,
    DspActionModule,
    DspApiConfigToken,
    DspApiConnectionToken,
    DspCoreModule
} from '@dasch-swiss/dsp-ui';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorComponent } from 'src/app/main/error/error.component';
import { TestConfig } from 'test.config';
import { ProjectsListComponent } from './projects-list/projects-list.component';
import { ProjectsComponent } from './projects.component';

describe('ProjectsComponent', () => {
    let component: ProjectsComponent;
    let fixture: ComponentFixture<ProjectsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ProjectsComponent,
                ProjectsListComponent,
                DialogComponent,
                ErrorComponent
            ],
            imports: [
                BrowserAnimationsModule,
                DspActionModule,
                DspCoreModule,
                MatButtonModule,
                MatChipsModule,
                MatDialogModule,
                MatIconModule,
                MatMenuModule,
                RouterTestingModule
            ],
            providers: [
                AppInitService,
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // todo: should get the list of projects (active and deactivated), should create/edit/deactivate a project
});
