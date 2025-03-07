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
import { GroupName } from './group-name';
import { ProjectIri } from './project-iri';
import { GroupSelfJoin } from './group-self-join';
import { GroupStatus } from './group-status';
import { GroupIri } from './group-iri';
import { GroupDescriptions } from './group-descriptions';


export interface GroupCreateRequest { 
    id?: GroupIri;
    name: GroupName;
    descriptions: GroupDescriptions;
    project: ProjectIri;
    status: GroupStatus;
    selfjoin: GroupSelfJoin;
}

