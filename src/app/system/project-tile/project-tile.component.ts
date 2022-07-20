import { Component, Input, OnInit } from '@angular/core';
import { StoredProject } from '@dasch-swiss/dsp-js';

@Component({
    selector: 'app-project-tile',
    templateUrl: './project-tile.component.html',
    styleUrls: ['./project-tile.component.scss']
})
export class ProjectTileComponent implements OnInit {

    @Input() project: StoredProject;

    constructor() { }

    ngOnInit(): void {
    }

}
