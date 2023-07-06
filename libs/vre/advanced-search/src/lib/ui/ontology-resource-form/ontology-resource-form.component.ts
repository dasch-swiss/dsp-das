import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'dasch-swiss-ontology-resource-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule],
    templateUrl: './ontology-resource-form.component.html',
    styleUrls: ['./ontology-resource-form.component.scss'],
})
export class OntologyResourceFormComponent {
    @Input() ontologies: string[] | null = [];
    @Output() selectedOntology: string | undefined;

    selectedValue: string | undefined;

}
