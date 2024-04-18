import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-rich-text-switch',
  template: ` <div *ngIf="displayMode; else editMode" [innerHTML]="control.value"></div>
    <ng-template #editMode>
      <app-rich-text-value [control]="myControl"></app-rich-text-value>
    </ng-template>`,
})
export class RichTextSwitchComponent implements IsSwitchComponent {
  @Input() control!: FormControl<string | null>;
  @Input() displayMode = true;

  get myControl() {
    return this.control as FormControl<string>;
  }

  private static _handleXML(xml: string, fromKnora: boolean, addXMLDocType = true) {
    const xmlTransform = {
      '<hr>': '<hr/>',
      '<s>': '<strike>',
      '</s>': '</strike>',
      '<i>': '<em>',
      '</i>': '</em>',
      '<figure class="table">': '',
      '</figure>': '',
      '<br>': '<br/>',
    };
    const doctype = '<?xml version="1.0" encoding="UTF-8"?>';
    const textTag = 'text';
    const openingTextTag = `<${textTag}>`;
    const closingTextTag = `</${textTag}>`;

    // check if xml is a string
    if (typeof xml !== 'string') {
      return xml;
    }

    if (fromKnora) {
      // cKEditor accepts tags from version 4
      // see 4 to 5 migration, see https://ckeditor.com/docs/ckeditor5/latest/builds/guides/migrate.html
      return xml.replace(doctype, '').replace(openingTextTag, '').replace(closingTextTag, '');
    } else {
      // replace &nbsp; entity
      xml = xml.replace(/&nbsp;/g, String.fromCharCode(160));

      // get XML transform config
      const keys = Object.keys(xmlTransform);
      for (const key of keys) {
        // replace tags defined in config
        xml = xml.replace(new RegExp(key, 'g'), xmlTransform[key]);
      }

      if (addXMLDocType) {
        return doctype + openingTextTag + xml + closingTextTag;
      } else {
        return xml;
      }
    }
  }
}
