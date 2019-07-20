export class Property {

    label: string;
    type: string;
    multiple: boolean;
    required: boolean;
    permission: string;

    constructor (label?: string, type?: string, multiple?: boolean, required?: boolean, permission?: string) {
        this.label = label;
        this.type = type;
        this.multiple = multiple;
        this.required = required;
        this.permission = permission;
    }
}
