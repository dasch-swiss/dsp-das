import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CacheService } from './cache.service';

describe('CacheService', () => {
    beforeEach(async() => {
        TestBed.configureTestingModule({
            imports: [
                MatSnackBarModule
            ]
        })
    });

    it('should be created', () => {
        const service: CacheService = TestBed.inject(CacheService);
        expect(service).toBeTruthy();
    });

    // todo: get cache, set cache, delete cache, check if the key exists, destroy cache
});
