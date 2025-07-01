import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PropertyInfo } from '../../../ontology.types';

@Component({
  selector: 'app-resource-class-property-info',
  templateUrl: './resource-class-property-info.component.html',
  styleUrls: ['./resource-class-property-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceClassPropertyInfoComponent {
  @Input({ required: true }) property!: PropertyInfo;
}
