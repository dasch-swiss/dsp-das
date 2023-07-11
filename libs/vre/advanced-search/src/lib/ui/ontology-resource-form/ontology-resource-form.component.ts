import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'dasch-swiss-ontology-resource-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule],
    templateUrl: './ontology-resource-form.component.html',
    styleUrls: ['./ontology-resource-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OntologyResourceFormComponent {
    @Input() ontologies: string[] | null = []; // todo: handle null case in html
    @Input() resourceClasses: string[] | null = [];

    @Input() set selectedOntology(ontology: string | null | undefined) {
        if(!this.ontologiesList) return;
        if (ontology) {
            this.ontologiesList.value = ontology;
        } else {
            this.ontologiesList.value = '';
        }
    }

    @Input() set selectedResourceClass(resourceClass: string | null | undefined) {
        if(!this.resourceClassesList) return;
        if (resourceClass) {
            this.resourceClassesList.value = resourceClass;
        } else {
            this.resourceClassesList.value = '';
        }
    }

    @Output() emitSelectedOntology = new EventEmitter<string>();
    @Output() emitSelectedResourceClass = new EventEmitter<string>();

    @ViewChild('ontologiesList') ontologiesList!: MatSelect;
    @ViewChild('resourceClassesList') resourceClassesList!: MatSelect;

    onSelectedOntologyChanged(): void {
        const selectedOntology = this.ontologiesList.value;
        this.emitSelectedOntology.emit(selectedOntology);
    }

    onSelectedResourceClassChanged(): void {
        const selectedResourceClass = this.resourceClassesList.value;
        this.emitSelectedResourceClass.emit(selectedResourceClass);
    }
}
