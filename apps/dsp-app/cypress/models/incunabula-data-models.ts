export interface MiscClass {
  label: string;
  color: string;
  colorComment: string;
  book: string;
  bookComment: string;
}

export interface SidebandClass {
  label: string;
  file: string;
  title: string;
  // titleComment: string;
  // description: string;
  // descriptionComment: string;
  // comments: [Comment];
}

export interface Comment {
  text: string;
  comment: string;
}
