import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resource-representation-container',
  host: {
    '[style.--height]': 'small ? "200px" : "900px"',
  },
  template: `
    <div class="representation-container center">
      <ng-content />
    </div>
  `,
  styles: [
    `
      .representation-container {
        height: var(--height);
        border-radius: 8px;
        overflow: hidden;
        background: rgb(41, 41, 41);
        color: white;
      }
    `,
  ],
})
export class ResourceRepresentationContainerComponent {
  @Input() small = false;
}
