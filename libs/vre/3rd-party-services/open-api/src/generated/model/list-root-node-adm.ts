/**
 * DSP-API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.1.15
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { StringLiteralSequenceV2 } from './string-literal-sequence-v2';
import { ListChildNodeADM } from './list-child-node-adm';


export interface ListRootNodeADM { 
    id: string;
    projectIri: string;
    name?: string;
    labels: StringLiteralSequenceV2;
    comments: StringLiteralSequenceV2;
    children?: Array<ListChildNodeADM>;
    isRootNode: boolean;
}

