import { Property } from './property.model';


export class SourceType {
    label: string;
    permission: string;
    properties: Property[];

    constructor (label: string, permission: string, properties?: Property[]) {
        this.label = label;
        this.permission = permission;
        this.properties = properties;
    }
}
