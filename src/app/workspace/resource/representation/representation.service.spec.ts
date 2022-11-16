import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppInitService } from 'src/app/app-init.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';

import { RepresentationService } from './representation.service';

const appInitSpy = {
    dspAppConfig: {
        iriBase: 'http://rdfh.ch'
    }
};

fdescribe('RepresentationService', () => {
    let service: RepresentationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                MatDialogModule
            ],
            providers: [
                AppInitService,
                {
                    provide: DspApiConnectionToken,
                    useValue: appInitSpy
                }
            ]
        });
        service = TestBed.inject(RepresentationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
