import { TestBed } from '@angular/core/testing';
import { SessionService } from './app-session';
import { of } from 'rxjs';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import {
    ApiResponseData,
    ReadUser,
    UserResponse,
} from '@dasch-swiss/dsp-js';
import { AjaxResponse } from 'rxjs/ajax';

describe('SessionService', () => {
    let service: SessionService;
    let mockApiConnection: any;
    const mockSession = {
        id: 12345,
        user: {
            name: 'test',
            jwt: 'jwt',
            lang: 'en',
            sysAdmin: false,
            projectAdmin: [],
        },
    };

    beforeEach(() => {
        mockApiConnection = {
            admin: {
                usersEndpoint: {
                    getUser: jest.fn(),
                },
            },
            v2: {
                jsonWebToken: '',
            },
        };

        TestBed.configureTestingModule({
            providers: [
                SessionService,
                {
                    provide: DspApiConnectionToken,
                    useValue: mockApiConnection,
                },
            ],
        });

        service = TestBed.inject(SessionService);
    });

    afterEach(() => {
        localStorage.removeItem('session');
        jest.clearAllMocks();
    });

    it('should get session from localstorage', () => {
        localStorage.setItem('session', JSON.stringify(mockSession));
        const session = service.getSession();
        expect(session).toEqual(mockSession);
    });

    it('should return null if no session in localstorage', () => {
        const session = service.getSession();
        expect(session).toBeNull();
    });

    it('should set session in localstorage', (done) => {
        const jwt = 'jwt';
        const identifier = 'test';
        const type = 'username';

        const user = new ReadUser();
        user.id = '12345';
        user.username = 'test';

        const userRes = new UserResponse();
        userRes.user = user;

        const responseData = ApiResponseData.fromAjaxResponse(new AjaxResponse({} as any, {} as any, {}));
        responseData.body = userRes;

        mockApiConnection.admin.usersEndpoint.getUser.mockReturnValue(
            of(responseData)
        );

        service.setSession(jwt, identifier, type).subscribe(() => {
            const session = JSON.parse(localStorage.getItem('session') || '');
            expect(session.user.name).toEqual(identifier);
            expect(session.user.jwt).toEqual(jwt);
            done();
        });
    });
});
