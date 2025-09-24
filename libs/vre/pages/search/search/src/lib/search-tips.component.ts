import { Component } from '@angular/core';

@Component({
  selector: 'app-search-tips',
  template: ` <div
    style="
          max-width: 500px;
    background: #ebebeb;
    border-radius: 5px;
    padding: 16px">
    Search tips
    <ul>
      <li>Quotation marks for exact phrases: "down the rabbit hole"</li>
      <li>AND, OR, NOT for boolean searches: Alice AND Wonderland</li>
      <li>Wildcards: Alice* will match Alice, Alices, etc.</li>
    </ul>
  </div>`,
  styles: [
    `
      li {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class SearchTipsComponent {}
