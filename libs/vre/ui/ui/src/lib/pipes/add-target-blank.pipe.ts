import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'addTargetBlank',
  standalone: false,
})
export class AddTargetBlankPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: null | string | SafeHtml): SafeHtml | null {
    if (value === null) {
      return value; // Return as is if value is empty or null
    }

    const htmlString = typeof value === 'string' ? value : value['changingThisBreaksApplicationSecurity'];

    // Create a temporary DOM element to manipulate the HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    const links = tempDiv.querySelectorAll('a');
    links.forEach((link: HTMLAnchorElement) => {
      const hrefValue = link.getAttribute('href');

      if (hrefValue && hrefValue.startsWith('#')) {
        // Skip internal links
        link.href = window.location.pathname + hrefValue;
        return;
      }

      if (!link.hasAttribute('target')) {
        link.setAttribute('target', '_blank');
      }
    });

    // Return the modified HTML string
    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
  }
}
