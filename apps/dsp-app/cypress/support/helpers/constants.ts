export const CLASS_TYPES = {
  stillImageRepresentation: {
    type: 'StillImageRepresentation',
    label: 'Still image',
  },
  textRepresentation: {
    type: 'TextRepresentation',
    label: 'Text',
  },
} as const;

export enum PropertyType {
  Text = 'Text',
  List = 'List',
  Boolean = 'Boolean',
  DateTime = 'Date / Time',
  Number = 'Number',
  LinkRelation = 'Link / Relation',
  Location = 'Location',
  Shape = 'Shape',
  Short = 'Short',
  Paragraph = 'Paragraph',
  Richtext = 'Richtext',
  Dropdown = 'Dropdown',
  YesNo = 'Yes / No',
  Date = 'Date',
  Timestamp = 'Timestamp',
  TimeSequence = 'Time sequence',
  Integer = 'Integer',
  Decimal = 'Decimal',
  PageNumber = 'Page number',
  LinkToClass = 'Link to class',
  PartOfClass = 'Part of class',
  ExternalUrl = 'External URL',
  Place = 'Place',
  Color = 'Color',
}
