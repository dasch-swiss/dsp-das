import { Constants } from '@dasch-swiss/dsp-js';

export class ckEditor {
  static config = {
    entities: false,
    licenseKey: 'GPL',
    toolbar: {
      items: [
        'heading',
        'bold',
        '|',
        'italic',
        'underline',
        'strikethrough',
        'subscript',
        'superscript',
        '|',
        'removeFormat',
        '|',
        'undo',
        'redo',
        '-',
        'link',
        '|',
        'bulletedList',
        'numberedList',
        'horizontalLine',
        '|',
        'blockQuote',
        'code',
        'codeBlock',
        'insertTable',
        'specialCharacters',
        '|',
        'sourceEditing',
        '|',
        'footnote',
      ],
      shouldNotGroupWhenFull: true,
    },
    heading: {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph',
        },
        { model: 'heading1', view: 'h1', title: 'Heading 1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6' },
        { model: 'formatted', view: 'pre', title: 'Formatted' },
        { model: 'cite', view: 'cite', title: 'Cited' },
      ],
    },
    codeBlock: {
      languages: [{ language: 'plaintext', label: 'Plain text', class: '' }],
    },
    language: 'en',
    link: {
      addTargetToExternalLinks: false,
      decorators: {
        isInternal: {
          // DO NOT REMOVE THIS.. ADDING THIS CLASS MAKES THE BACKEND KNOW IT'S AN INTERNAL LINK.
          mode: 'automatic', // automatic requires callback
          callback: (url: string) => !!url && url.startsWith('http://rdfh.ch/'),
          attributes: {
            class: Constants.SalsahLink,
          },
        },
      },
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow'], // mergeTableCells is not supported by the backend due to colspan html tag mapping.
    },
  };
}
