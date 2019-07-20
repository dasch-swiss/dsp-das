import { Property } from './property.model';


export class SourceType {
    label: string;
    description: string;
    permission: string;
    properties: Property[];

    constructor (label: string, description: string, permission: string, properties?: Property[]) {
        this.label = label;
        this.description = description;
        this.permission = permission;
        this.properties = properties;
    }
}
