/**
 * DSP-API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.1.17
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
import { NotFoundException } from '../model/not-found-exception';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';



@Injectable({
  providedIn: 'root'
})
export class V2ValuesApiService {

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
     * Find detailed documentation on &lt;a href&#x3D;\&quot;https://docs.dasch.swiss/latest/DSP-API/03-endpoints/api-v2/editing-values/\&quot;&gt;docs.dasch.swiss&lt;/a&gt;.
     * @param resourceIri The IRI of a Resource.
     * @param valueUuid The UUID of a Value.
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param version 
     * @param xKnoraAcceptSchema The ontology schema to be used for the request. If not specified, the default schema ApiV2Complex will be used.
     * @param schema The ontology schema to be used for the request. If not specified, the default schema ApiV2Complex will be used.
     * @param xKnoraJsonLdRendering The JSON-LD rendering to be used for the request (flat or hierarchical). If not specified, hierarchical JSON-LD will be used.
     * @param markup The markup rendering to be used for the request (XML or standoff).
     * @param xKnoraAcceptMarkup The markup rendering to be used for the request (XML or standoff).
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getV2ValuesResourceiriValueuuid(resourceIri: string, valueUuid: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, version?: string, xKnoraAcceptSchema?: string, schema?: string, xKnoraJsonLdRendering?: string, markup?: string, xKnoraAcceptMarkup?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<string>;
    public getV2ValuesResourceiriValueuuid(resourceIri: string, valueUuid: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, version?: string, xKnoraAcceptSchema?: string, schema?: string, xKnoraJsonLdRendering?: string, markup?: string, xKnoraAcceptMarkup?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<string>>;
    public getV2ValuesResourceiriValueuuid(resourceIri: string, valueUuid: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, version?: string, xKnoraAcceptSchema?: string, schema?: string, xKnoraJsonLdRendering?: string, markup?: string, xKnoraAcceptMarkup?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<string>>;
    public getV2ValuesResourceiriValueuuid(resourceIri: string, valueUuid: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, version?: string, xKnoraAcceptSchema?: string, schema?: string, xKnoraJsonLdRendering?: string, markup?: string, xKnoraAcceptMarkup?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (resourceIri === null || resourceIri === undefined) {
            throw new Error('Required parameter resourceIri was null or undefined when calling getV2ValuesResourceiriValueuuid.');
        }
        if (valueUuid === null || valueUuid === undefined) {
            throw new Error('Required parameter valueUuid was null or undefined when calling getV2ValuesResourceiriValueuuid.');
        }

        let localVarQueryParameters = new HttpParams({encoder: this.encoder});
        if (version !== undefined && version !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>version, 'version');
        }
        if (schema !== undefined && schema !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>schema, 'schema');
        }
        if (markup !== undefined && markup !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>markup, 'markup');
        }

        let localVarHeaders = this.defaultHeaders;
        if (xKnoraAcceptSchema !== undefined && xKnoraAcceptSchema !== null) {
            localVarHeaders = localVarHeaders.set('x-knora-accept-schema', String(xKnoraAcceptSchema));
        }
        if (xKnoraJsonLdRendering !== undefined && xKnoraJsonLdRendering !== null) {
            localVarHeaders = localVarHeaders.set('x-knora-json-ld-rendering', String(xKnoraJsonLdRendering));
        }
        if (xKnoraAcceptMarkup !== undefined && xKnoraAcceptMarkup !== null) {
            localVarHeaders = localVarHeaders.set('x-knora-accept-markup', String(xKnoraAcceptMarkup));
        }

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

        let localVarPath = `/v2/values/${this.configuration.encodeParam({name: "resourceIri", value: resourceIri, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}/${this.configuration.encodeParam({name: "valueUuid", value: valueUuid, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}`;
        return this.httpClient.request<string>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                params: localVarQueryParameters,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Find detailed documentation on &lt;a href&#x3D;\&quot;https://docs.dasch.swiss/latest/DSP-API/03-endpoints/api-v2/editing-values/\&quot;&gt;docs.dasch.swiss&lt;/a&gt;.
     * @param body 
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public postV2Values(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<string>;
    public postV2Values(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<string>>;
    public postV2Values(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<string>>;
    public postV2Values(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling postV2Values.');
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

        let localVarPath = `/v2/values`;
        return this.httpClient.request<string>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: body,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Find detailed documentation on &lt;a href&#x3D;\&quot;https://docs.dasch.swiss/latest/DSP-API/03-endpoints/api-v2/editing-values/\&quot;&gt;docs.dasch.swiss&lt;/a&gt;.
     * @param body 
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public postV2ValuesDelete(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<string>;
    public postV2ValuesDelete(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<string>>;
    public postV2ValuesDelete(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<string>>;
    public postV2ValuesDelete(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling postV2ValuesDelete.');
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

        let localVarPath = `/v2/values/delete`;
        return this.httpClient.request<string>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: body,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Erase a Value and all of its old versions from the database completely. Find detailed documentation on &lt;a href&#x3D;\&quot;https://docs.dasch.swiss/latest/DSP-API/03-endpoints/api-v2/editing-values/\&quot;&gt;docs.dasch.swiss&lt;/a&gt;.
     * @param body 
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public postV2ValuesErase(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<string>;
    public postV2ValuesErase(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<string>>;
    public postV2ValuesErase(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<string>>;
    public postV2ValuesErase(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling postV2ValuesErase.');
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

        let localVarPath = `/v2/values/erase`;
        return this.httpClient.request<string>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: body,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Erase all old versions of a Value from the database completely and keep only the latest version. Find detailed documentation on &lt;a href&#x3D;\&quot;https://docs.dasch.swiss/latest/DSP-API/03-endpoints/api-v2/editing-values/\&quot;&gt;docs.dasch.swiss&lt;/a&gt;.
     * @param body 
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public postV2ValuesErasehistory(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<string>;
    public postV2ValuesErasehistory(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<string>>;
    public postV2ValuesErasehistory(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<string>>;
    public postV2ValuesErasehistory(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling postV2ValuesErasehistory.');
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

        let localVarPath = `/v2/values/erasehistory`;
        return this.httpClient.request<string>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: body,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Find detailed documentation on &lt;a href&#x3D;\&quot;https://docs.dasch.swiss/latest/DSP-API/03-endpoints/api-v2/editing-values/\&quot;&gt;docs.dasch.swiss&lt;/a&gt;.
     * @param body 
     * @param knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public putV2Values(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<string>;
    public putV2Values(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<string>>;
    public putV2Values(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<string>>;
    public putV2Values(body: string, knoraAuthenticationMFYGSLTEMV3C4ZDBONRWQLTTO5UXG4Z2GQ2DG999?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling putV2Values.');
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

        let localVarPath = `/v2/values`;
        return this.httpClient.request<string>('put', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: body,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
