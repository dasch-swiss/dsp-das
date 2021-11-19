import { Constants } from '@dasch-swiss/dsp-js';


const items = [
    { id: '@swarley', userId: '1', name: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
    { id: '@lilypad', userId: '2', name: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
    { id: '@marshmallow', userId: '3', name: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
    { id: '@rsparkles', userId: '4', name: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
    { id: '@tdog', userId: '5', name: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
];

function getFeedItems( queryText ) {

    // filtering function - it uses the `name` and `username` properties of an item to find a match.
    function isItemMatching( item ) {
        // make the search case-insensitive.
        const searchString = queryText.toLowerCase();

        // include an item in the search results if the name or username includes the current user input.
        return (
            item.name.toLowerCase().includes( searchString ) ||
            item.id.toLowerCase().includes( searchString )
        );
    }
    // as an example of an asynchronous action, return a promise
    // that resolves after a 100ms timeout.
    // this can be a server request or any sort of delayed action.
    return new Promise( resolve => {
        setTimeout( () => {
            const itemsToDisplay = items
                // filter out the full list of all items to only those matching the query text.
                .filter( isItemMatching )
                // return 10 items max - needed for generic queries when the list may contain hundreds of elements.
                .slice( 0, 10 );

            resolve( itemsToDisplay );
        }, 100 );
    } );
}

// function getFeedItems(): string[] {
//     return ['@Barney', '@Lily', '@Marshall', '@Robin', '@Ted'];
// }

export class ckEditor {

    static config = {
        entities: false,
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
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
            ],
            shouldNotGroupWhenFull: true
        },
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3' },
                { model: 'heading4', view: 'h4', title: 'Heading 4' },
                { model: 'heading5', view: 'h5', title: 'Heading 5' },
                { model: 'heading6', view: 'h6', title: 'Heading 6' },
                { model: 'formatted', view: 'pre', title: 'Formatted' },
                { model: 'cite', view: 'cite', title: 'Cited' }
            ]
        },
        codeBlock: {
            languages: [
                { language: 'plaintext', label: 'Plain text', class: '' }
            ]
        },
        mention: {
            feeds: [
                {
                    marker: '@',
                    feed: getFeedItems,
                    minimumCharacters: 1
                }
            ]
        },
        language: 'en',
        link: {
            addTargetToExternalLinks: false,
            decorators: {
                isInternal: {
                    // label: 'internal link to a Knora resource',
                    mode: 'automatic', // automatic requires callback -> but the callback is async and the user could save the text before the check ...
                    callback: url =>  // console.log(url, url.startsWith( 'http://rdfh.ch/' ));
                        !!url && url.startsWith('http://rdfh.ch/')  // --> TODO: get this from config via AppInitService
                    ,
                    attributes: {
                        class: Constants.SalsahLink
                    }
                }
            }
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells'
            ]
        }
    };

}


