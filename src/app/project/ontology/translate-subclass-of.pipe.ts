import { Pipe, PipeTransform } from '@angular/core';
import { DefaultInfo, DefaultResourceClasses } from './default-data/default-resource-classes';

@Pipe({
    name: 'translateSubclassOf'
})
export class TranslateSubclassOfPipe implements PipeTransform {

    defaultClasses: DefaultInfo[] = DefaultResourceClasses.data;

    transform(value: string): string {
        const defaultClass = this.defaultClasses.find(i => i.iri === value);
        if (defaultClass) {
            return defaultClass.label;
        } else {
            // the subClass is not a subClass of the default classes
            // get class name from iri
            const name = value.split('#')[1];
            if (name) {
                return `Type ${name}`;
            }
        }
    }

}
