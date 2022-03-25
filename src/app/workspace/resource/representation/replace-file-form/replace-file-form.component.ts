import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UpdateFileValue } from '@dasch-swiss/dsp-js';
import { UploadComponent } from '../upload/upload.component';

@Component({
    selector: 'app-replace-file-form',
    templateUrl: './replace-file-form.component.html',
    styleUrls: ['./replace-file-form.component.scss']
})
export class ReplaceFileFormComponent implements OnInit {
    @Input() representation: 'stillImage' | 'movingImage' | 'audio' | 'document' | 'text' | 'archive';
    @Input() propId: string;

    @Output() closeDialog: EventEmitter<UpdateFileValue> = new EventEmitter<UpdateFileValue>();

    @ViewChild('upload') uploadComponent: UploadComponent;

    fileValue: UpdateFileValue;

    constructor() { }

    ngOnInit(): void {
    }

    setFileValue(file: UpdateFileValue) {
        this.fileValue = file;
        console.log('new file: ', this.fileValue);
        console.log('propId: ', this.propId);
    }

    saveFile() {
        const updateVal = this.uploadComponent.getUpdatedValue(this.propId);

        if(updateVal instanceof UpdateFileValue) {
            updateVal.filename = this.fileValue.filename;
            updateVal.id = this.propId;
            this.closeDialog.emit(updateVal);
        } else {
            console.log('expected UpdateFileValue, got: ', updateVal);
        }
    }

}
