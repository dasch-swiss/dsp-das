/**
 * DSP-API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.0.21
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { PermissionADM } from './permission-adm';


export interface CreateDefaultObjectAccessPermissionAPIRequestADM { 
    id?: string;
    forProject: string;
    forGroup?: string;
    forResourceClass?: string;
    forProperty?: string;
    hasPermissions?: Array<PermissionADM>;
}

