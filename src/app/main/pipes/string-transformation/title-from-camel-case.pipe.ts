import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'titleFromCamelCase'
})
export class TitleFromCamelCasePipe implements PipeTransform {

    transform(value: string): string {
        return value.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1');
    }

}
