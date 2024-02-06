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
import { ProjectADM } from './project-adm';
import { StringLiteralV2 } from './string-literal-v2';


export interface GroupADM { 
    id: string;
    name: string;
    descriptions?: Array<StringLiteralV2>;
    project: ProjectADM;
    status: boolean;
    selfjoin: boolean;
}

