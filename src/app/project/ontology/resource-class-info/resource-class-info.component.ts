import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-resource-class-info',
    templateUrl: './resource-class-info.component.html',
    styleUrls: ['./resource-class-info.component.scss']
})
export class ResourceClassInfoComponent implements OnInit {

    @Input() resourceClass;

    constructor() { }

    ngOnInit(): void {
        console.log(this.resourceClass)
    }

}
