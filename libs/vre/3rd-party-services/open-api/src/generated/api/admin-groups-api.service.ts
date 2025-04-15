/**
 * DSP-API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.1.16
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec, HttpContext 
        }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../encoder';
import { Observable }                                        from 'rxjs';

// @ts-ignore
import { BadCredentialsException } from '../model/bad-credentials-exception';
// @ts-ignore
import { ForbiddenException } from '../model/forbidden-exception';
// @ts-ignore
import { GetV2Authentication400Response } from '../model/get-v2-authentication400-response';
// @ts-ignore
import { GroupCreateRequest } from '../model/group-create-request';
// @ts-ignore
import { GroupGetResponseADM } from '../model/group-get-response-adm';
// @ts-ignore
import { GroupMembersGetResponseADM } from '../model/group-members-get-response-adm';
// @ts-ignore
import { GroupStatusUpdateRequest } from '../model/group-status-update-request';
// @ts-ignore
import { GroupUpdateRequest } from '../model/group-update-request';
// @ts-ignore
import { GroupsGetResponseADM } from '../model/groups-get-response-adm';
// @ts-ignore
import { NotFoundException } from '../model/not-found-exception';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';



@Injectable({
  providedIn: 'root'
})
export class AdminGroupsApiService {

    protected basePath = 'https://api.dev.dasch.swiss:443';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();
    public encoder: HttpParameterCodec;

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string|string[], @Optional() configuration: Configuration) {
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            if (Array.isArray(basePath) && basePath.length > 0) {
                basePath = basePath[0];
            }

            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }


    // @ts-ignore
    private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        } else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }

    private addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams {
        if (value == null) {
            return httpParams;
        }

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                (value as any[]).forEach( elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            } else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, (value as Date).toISOString().substring(0, 10));
                } else {
                   throw Error("key may not be null if value is Date");
                }
            } else {
                Object.keys(value).forEach( k => httpParams = this.addToHttpParamsRecursive(
                    httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        } else if (key != null) {
            httpParams = httpParams.append(key, value);
        } else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }

    /**
     * **Required permissions**: User must SystemAdmin or ProjectAdmin of the project the group is created in.
     * @param groupCreateRequest 
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createNewGroup(groupCreateRequest: GroupCreateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<GroupGetResponseADM>;
    public createNewGroup(groupCreateRequest: GroupCreateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<GroupGetResponseADM>>;
    public createNewGroup(groupCreateRequest: GroupCreateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<GroupGetResponseADM>>;
    public createNewGroup(groupCreateRequest: GroupCreateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (groupCreateRequest === null || groupCreateRequest === undefined) {
            throw new Error('Required parameter groupCreateRequest was null or undefined when calling createNewGroup.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (httpAuth1) required
        localVarCredential = this.configuration.lookupCredential('httpAuth1');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
        }

        // authentication (httpAuth) required
        localVarCredential = this.configuration.lookupCredential('httpAuth');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/admin/groups`;
        return this.httpClient.request<GroupGetResponseADM>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: groupCreateRequest,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Deletes a group by changing its status to \&#39;false\&#39;.
     * @param groupIri The IRI of a group. Must be URL-encoded.
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deleteAdminGroupsGroupiri(groupIri: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<GroupGetResponseADM>;
    public deleteAdminGroupsGroupiri(groupIri: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<GroupGetResponseADM>>;
    public deleteAdminGroupsGroupiri(groupIri: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<GroupGetResponseADM>>;
    public deleteAdminGroupsGroupiri(groupIri: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (groupIri === null || groupIri === undefined) {
            throw new Error('Required parameter groupIri was null or undefined when calling deleteAdminGroupsGroupiri.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (httpAuth1) required
        localVarCredential = this.configuration.lookupCredential('httpAuth1');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
        }

        // authentication (httpAuth) required
        localVarCredential = this.configuration.lookupCredential('httpAuth');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/admin/groups/${this.configuration.encodeParam({name: "groupIri", value: groupIri, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}`;
        return this.httpClient.request<GroupGetResponseADM>('delete', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Return all groups.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getAdminGroups(observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<GroupsGetResponseADM>;
    public getAdminGroups(observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<GroupsGetResponseADM>>;
    public getAdminGroups(observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<GroupsGetResponseADM>>;
    public getAdminGroups(observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/admin/groups`;
        return this.httpClient.request<GroupsGetResponseADM>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Return a single group identified by its IRI.
     * @param groupIri The IRI of a group. Must be URL-encoded.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getAdminGroupsGroupiri(groupIri: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<GroupGetResponseADM>;
    public getAdminGroupsGroupiri(groupIri: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<GroupGetResponseADM>>;
    public getAdminGroupsGroupiri(groupIri: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<GroupGetResponseADM>>;
    public getAdminGroupsGroupiri(groupIri: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (groupIri === null || groupIri === undefined) {
            throw new Error('Required parameter groupIri was null or undefined when calling getAdminGroupsGroupiri.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/admin/groups/${this.configuration.encodeParam({name: "groupIri", value: groupIri, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}`;
        return this.httpClient.request<GroupGetResponseADM>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Return all members of a single group.
     * @param groupIri The IRI of a group. Must be URL-encoded.
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getAdminGroupsGroupiriMembers(groupIri: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<GroupMembersGetResponseADM>;
    public getAdminGroupsGroupiriMembers(groupIri: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<GroupMembersGetResponseADM>>;
    public getAdminGroupsGroupiriMembers(groupIri: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<GroupMembersGetResponseADM>>;
    public getAdminGroupsGroupiriMembers(groupIri: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (groupIri === null || groupIri === undefined) {
            throw new Error('Required parameter groupIri was null or undefined when calling getAdminGroupsGroupiriMembers.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (httpAuth1) required
        localVarCredential = this.configuration.lookupCredential('httpAuth1');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
        }

        // authentication (httpAuth) required
        localVarCredential = this.configuration.lookupCredential('httpAuth');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/admin/groups/${this.configuration.encodeParam({name: "groupIri", value: groupIri, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}/members`;
        return this.httpClient.request<GroupMembersGetResponseADM>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Update a group\&#39;s basic information.
     * @param groupIri The IRI of a group. Must be URL-encoded.
     * @param groupUpdateRequest 
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public putAdminGroupsGroupiri(groupIri: string, groupUpdateRequest: GroupUpdateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<GroupGetResponseADM>;
    public putAdminGroupsGroupiri(groupIri: string, groupUpdateRequest: GroupUpdateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<GroupGetResponseADM>>;
    public putAdminGroupsGroupiri(groupIri: string, groupUpdateRequest: GroupUpdateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<GroupGetResponseADM>>;
    public putAdminGroupsGroupiri(groupIri: string, groupUpdateRequest: GroupUpdateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (groupIri === null || groupIri === undefined) {
            throw new Error('Required parameter groupIri was null or undefined when calling putAdminGroupsGroupiri.');
        }
        if (groupUpdateRequest === null || groupUpdateRequest === undefined) {
            throw new Error('Required parameter groupUpdateRequest was null or undefined when calling putAdminGroupsGroupiri.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (httpAuth1) required
        localVarCredential = this.configuration.lookupCredential('httpAuth1');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
        }

        // authentication (httpAuth) required
        localVarCredential = this.configuration.lookupCredential('httpAuth');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/admin/groups/${this.configuration.encodeParam({name: "groupIri", value: groupIri, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}`;
        return this.httpClient.request<GroupGetResponseADM>('put', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: groupUpdateRequest,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Updates a group\&#39;s status.
     * @param groupIri The IRI of a group. Must be URL-encoded.
     * @param groupStatusUpdateRequest 
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public putAdminGroupsGroupiriStatus(groupIri: string, groupStatusUpdateRequest: GroupStatusUpdateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<GroupGetResponseADM>;
    public putAdminGroupsGroupiriStatus(groupIri: string, groupStatusUpdateRequest: GroupStatusUpdateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<GroupGetResponseADM>>;
    public putAdminGroupsGroupiriStatus(groupIri: string, groupStatusUpdateRequest: GroupStatusUpdateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<GroupGetResponseADM>>;
    public putAdminGroupsGroupiriStatus(groupIri: string, groupStatusUpdateRequest: GroupStatusUpdateRequest, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (groupIri === null || groupIri === undefined) {
            throw new Error('Required parameter groupIri was null or undefined when calling putAdminGroupsGroupiriStatus.');
        }
        if (groupStatusUpdateRequest === null || groupStatusUpdateRequest === undefined) {
            throw new Error('Required parameter groupStatusUpdateRequest was null or undefined when calling putAdminGroupsGroupiriStatus.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (httpAuth1) required
        localVarCredential = this.configuration.lookupCredential('httpAuth1');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
        }

        // authentication (httpAuth) required
        localVarCredential = this.configuration.lookupCredential('httpAuth');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/admin/groups/${this.configuration.encodeParam({name: "groupIri", value: groupIri, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}/status`;
        return this.httpClient.request<GroupGetResponseADM>('put', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: groupStatusUpdateRequest,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
