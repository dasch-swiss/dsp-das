import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileRepresentation } from '../file-representation';

import { ArchiveComponent } from './archive.component';

const archiveFileValue = {
    'arkUrl': 'http://0.0.0.0:3336/ark:/72163/1/0123/6c=f69h6Ss6GXPME565EqAS/dDHcFHlwQ9K46255QfUGrQ8',
    'attachedToUser': 'http://rdfh.ch/users/root',
    'fileUrl': 'http://0.0.0.0:1024/0123/Eu71soNXOAL-DVweVgODkFh.zip/file',
    'filename': 'Eu71soNXOAL-DVweVgODkFh.zip',
    'hasPermissions': 'CR knora-admin:ProjectAdmin|D knora-admin:ProjectAdmin|M knora-admin:ProjectAdmin|V knora-admin:ProjectAdmin|RV knora-admin:ProjectAdmin',
    'id': 'http://rdfh.ch/0123/6c-f69h6Ss6GXPME565EqA/values/dDHcFHlwQ9K46255QfUGrQ',
    'property': 'http://api.knora.org/ontology/knora-api/v2#hasArchiveFileValue',
    'propertyComment': 'Connects a Representation to a zip archive',
    'propertyLabel': 'hat Zip',
    'strval': 'http://0.0.0.0:1024/0123/Eu71soNXOAL-DVweVgODkFh.zip/file',
    'type': 'http://api.knora.org/ontology/knora-api/v2#ArchiveFileValue',
    'userHasPermission': 'CR',
    'uuid': 'dDHcFHlwQ9K46255QfUGrQ',
    'valueCreationDate': '2021-12-03T09:59:46.609839Z',
    'valueHasComment': undefined,
    'versionArkUrl': 'http://0.0.0.0:3336/ark:/72163/1/0123/6c=f69h6Ss6GXPME565EqAS/dDHcFHlwQ9K46255QfUGrQ8.20211203T095946609839Z'
};

@Component({
    template: `
        <app-archive [src]="archiveFileRepresentation">
        </app-archive>`
})
class TestHostComponent implements OnInit {

    @ViewChild(ArchiveComponent) archiveComp: ArchiveComponent;

    archiveFileRepresentation: FileRepresentation;

    ngOnInit() {

        this.archiveFileRepresentation = new FileRepresentation(archiveFileValue);
    }
}

describe('ArchiveComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ ArchiveComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostComponent).toBeTruthy();
    });
});
