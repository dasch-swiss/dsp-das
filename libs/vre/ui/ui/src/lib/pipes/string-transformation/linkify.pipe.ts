import { Pipe, PipeTransform } from '@angular/core';

/**
 * this pipe analyses a string and converts any url into a href tag
 *
 */
@Pipe({
  name: 'appLinkify',
  standalone: true,
})
export class LinkifyPipe implements PipeTransform {
  transform(value: string): string {
    if (value && value.length > 0) {
      const match = value.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi);
      let final = value;
      if (match) {
        match.forEach(url => {
          final = final.replace(url, `<a href="${url}" target="_blank">${url}</a>`);
        });
      }
      return final;
    } else {
      return value;
    }
  }
}
