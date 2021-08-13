import { Inject, Injectable } from '@angular/core';
import {
    ApiResponseData,
    ApiResponseError,
    Constants,
    CredentialsResponse,
    KnoraApiConnection,
    UserResponse
} from '@dasch-swiss/dsp-js';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DspApiConnectionToken } from '../declarations/dsp-api-tokens';

/**
 * information about the current user
 */
interface CurrentUser {
    // username
    name: string;

    // json web token
    jwt?: string;

    // default language for ui
    lang: string;

    // is system admin?
    sysAdmin: boolean;

    // list of project shortcodes where the user is project admin
    projectAdmin: string[];
}

/**
 * session with id (= login timestamp) and inforamtion about logged-in user
 */
export interface Session {
    id: number;
    user: CurrentUser;
}

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    /**
     * max session time in milliseconds
     * default value (24h): 86400000
     *
     */
    readonly MAX_SESSION_TIME: number = 86400000; // 1d = 24 * 60 * 60 * 1000


    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection
    ) { }

    /**
     * get session information from localstorage
     */
    getSession(): Session | null {
        return JSON.parse(localStorage.getItem('session'));
    }

    /**
     * set session by using the json web token (jwt) and the user object;
     * it will be used in the login process
     *
     * @param jwt Json Web Token
     * @param identifier  email address or username
     * @param identifierType 'email' or 'username'
     */
    setSession(jwt: string, identifier: string, identifierType: 'email' | 'username'): Observable<void> {

        this._dspApiConnection.v2.jsonWebToken = (jwt ? jwt : '');

        // get user information
        return this._dspApiConnection.admin.usersEndpoint.getUser(identifierType, identifier).pipe(
            map((response: ApiResponseData<UserResponse> | ApiResponseError) => {
                this._storeSessionInLocalStorage(response, jwt);
                // return type is void
                return;
            })
        );
    }

    /**
     * validate intern session and check knora api credentials if necessary.
     * If a json web token exists, it doesn't mean that the knora api credentials are still valid.
     *
     */
    isSessionValid(): Observable<boolean> {
        // mix of checks with session.validation and this.authenticate
        const session = JSON.parse(localStorage.getItem('session'));

        const tsNow: number = this._setTimestamp();

        if (session) {

            this._dspApiConnection.v2.jsonWebToken = session.user.jwt;

            // check if the session is still valid:
            if (session.id + this.MAX_SESSION_TIME <= tsNow) {
                // the internal (dsp-ui) session has expired
                // check if the api credentials are still valid

                return this._dspApiConnection.v2.auth.checkCredentials().pipe(
                    map((credentials: ApiResponseData<CredentialsResponse> | ApiResponseError) => {
                        const idUpdated = this._updateSessionId(credentials, session, tsNow);
                        return idUpdated;
                    }
                    )
                );

            } else {
                // the internal (dsp-ui) session is still valid
                return of(true);
            }
        } else {
            // no session found; update knora api connection with empty jwt
            this._dspApiConnection.v2.jsonWebToken = '';
            return of(false);
        }
    }

    /**
     * destroy session by removing the session from local storage
     *
     */
    destroySession() {
        localStorage.removeItem('session');
    }

    /**
     * returns a timestamp represented in seconds
     *
     */
    private _setTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * store session in local storage
     * @param response response from getUser method call
     * @param jwt JSON web token string
     */
    private _storeSessionInLocalStorage(response: any, jwt: string) {
        let session: Session;

        if (response instanceof ApiResponseData) {
            let sysAdmin = false;
            const projectAdmin: string[] = [];

            // get permission information: a) is user sysadmin? b) get list of project iri's where user is project admin
            const groupsPerProjectKeys: string[] = Object.keys(response.body.user.permissions.groupsPerProject);

            for (const key of groupsPerProjectKeys) {
                if (key === Constants.SystemProjectIRI) {
                    sysAdmin = response.body.user.permissions.groupsPerProject[key].indexOf(Constants.SystemAdminGroupIRI) > -1;
                }

                if (response.body.user.permissions.groupsPerProject[key].indexOf(Constants.ProjectAdminGroupIRI) > -1) {
                    projectAdmin.push(key);
                }
            }

            // store session information in browser's localstorage
            // tODO: jwt will be removed, when we have a better cookie solution (DSP-261)
            // --> no it can't be removed because the token is needed in sipi upload:
            // https://docs.dasch.swiss/DSP-API/03-apis/api-v2/editing-values/#upload-files-to-sipi
            session = {
                id: this._setTimestamp(),
                user: {
                    name: response.body.user.username,
                    jwt: jwt,
                    lang: response.body.user.lang,
                    sysAdmin: sysAdmin,
                    projectAdmin: projectAdmin
                }
            };

            // update localStorage
            localStorage.setItem('session', JSON.stringify(session));
        } else {
            localStorage.removeItem('session');
            console.error(response);
        }
    }

    /**
     * updates the id of the current session in the local storage
     * @param credentials response from getCredentials method call
     * @param session the current session
     * @param timestamp timestamp in form of a number
     */
    private _updateSessionId(credentials: any, session: Session, timestamp: number): boolean {
        if (credentials instanceof ApiResponseData) {
            // the knora api credentials are still valid
            // update the session.id
            session.id = timestamp;
            localStorage.setItem('session', JSON.stringify(session));
            return true;
        } else {
            // a user is not authenticated anymore!
            this.destroySession();
            return false;
        }
    }
}
