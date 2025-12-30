import { Component } from '@angular/core';

@Component({
  selector: 'app-resource-representation-container',
  template: `
    <div class="representation-container center">
      <ng-content />
    </div>
  `,
  styles: [
    `
      .representation-container {
        height: 600px;
        border-radius: 8px;
        overflow: hidden;
        background: rgb(41, 41, 41);
      }
    `,
  ],
})
export class ResourceRepresentationContainerComponent {}
