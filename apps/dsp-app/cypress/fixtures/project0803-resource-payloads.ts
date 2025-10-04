import { ArchiveClassResource, MiscClassResource, SidebandClassResource } from '../models/existing-data-models';
import { ProjectAssertionPageBase } from './project-assertion-payloads';

export class Project0803ResourcePayloads extends ProjectAssertionPageBase {
  static readonly project = '0803';
  static readonly defaultOntology = 'incunabula';

  constructor() {
    super(Project0803ResourcePayloads.project, Project0803ResourcePayloads.defaultOntology);
  }

  private hasColor(className: string, value: string, comment: string) {
    return {
      [`http://127.0.0.1:3333/ontology/${Project0803ResourcePayloads.project}/${Project0803ResourcePayloads.defaultOntology}/v2#${className}HasColor`]:
        {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#ColorValue',
          'http://api.knora.org/ontology/knora-api/v2#valueHasComment': comment,
          'http://api.knora.org/ontology/knora-api/v2#colorValueAsColor': value,
        },
    };
  }

  private richTextValue(propertyName: string, value: string, comment: string) {
    return {
      [`http://127.0.0.1:3333/ontology/${Project0803ResourcePayloads.project}/${Project0803ResourcePayloads.defaultOntology}/v2#${propertyName}`]:
        {
          '@type': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
          'http://api.knora.org/ontology/knora-api/v2#valueHasComment': comment,
          'http://api.knora.org/ontology/knora-api/v2#textValueAsXml': `<?xml version=\"1.0\" encoding=\"UTF-8\"?><text><p>${value}</p></text>`,
          'http://api.knora.org/ontology/knora-api/v2#textValueHasMapping': {
            '@id': 'http://rdfh.ch/standoff/mappings/StandardMapping',
          },
        },
    };
  }

  archive(data: ArchiveClassResource) {
    const request = {
      ...this.label(data.className, data.label),
      ...this.archiveSegment(data.file),
    };
    return request;
  }

  misc(data: MiscClassResource) {
    const className = 'misc';
    const request = {
      ...this.label(className, data.label),
      ...this.hasColor(className, data.color, data.colorComment),
    };
    return request;
  }

  sideband(data: SidebandClassResource) {
    const className = 'Sideband';
    const request = {
      ...this.label(className, data.label),
      ...this.textValue('sbTitle', data.title, data.titleComment),
      ...this.stillImage(data.file),
      ...this.richTextValue('description', data.description, data.descriptionComment),
      ...this.richTextValue('sideband_comment', data.comments[0].text, data.comments[0].comment),
    };
    return request;
  }
}
