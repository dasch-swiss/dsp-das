import { TestBed } from '@angular/core/testing';
import { AppInitService } from 'src/app/app-init.service';
import { ResourceService } from './resource.service';

describe('ResourceService', () => {
    let service: ResourceService;

    const appInitSpy = {
        dspAppConfig: {
            iriBase: 'http://rdfh.ch'
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AppInitService,
                    useValue: appInitSpy
                }
            ]
        });
        service = TestBed.inject(ResourceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
