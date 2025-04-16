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
import { Project } from './project';
import { StringLiteralV2 } from './string-literal-v2';


export interface Group { 
    id: string;
    name: string;
    descriptions?: Array<StringLiteralV2>;
    project?: Project;
    status: boolean;
    selfjoin: boolean;
}

