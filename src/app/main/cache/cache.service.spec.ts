import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DspApiConnectionToken } from '../declarations/dsp-api-tokens';
import { CacheService } from './cache.service';

describe('CacheService', () => {
    beforeEach(() => {

        const apiEndpointSpyObj = {
            v2: {
                auth: jasmine.createSpyObj('auth', ['logout'])
            }
        };

        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                MatDialogModule,
                MatSnackBarModule
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: apiEndpointSpyObj
                },
            ]
        });
    });

    it('should be created', () => {
        const service: CacheService = TestBed.inject(CacheService);
        expect(service).toBeTruthy();
    });

    // todo: get cache, set cache, delete cache, check if the key exists, destroy cache
});
