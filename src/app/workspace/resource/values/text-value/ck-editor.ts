import { Constants, KnoraApiConfig, KnoraApiConnection, ReadResourceSequence } from '@dasch-swiss/dsp-js';

// const items = [
//     { id: '@swarley', userId: '1', name: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
//     { id: '@lilypad', userId: '2', name: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
//     { id: '@marshmallow', userId: '3', name: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
//     { id: '@rsparkles', userId: '4', name: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
//     { id: '@tdog', userId: '5', name: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
// ];

function getFeedItems( queryText ) {
    const dspApiConfig = new KnoraApiConfig(
        'http',
        '0.0.0.0',
        3333,
        '',
        '',
        false
    );

    const dspApiConnection = new KnoraApiConnection(dspApiConfig);
    // as an example of an asynchronous action, return a promise
    // that resolves after a 100ms timeout.
    // this can be a server request or any sort of delayed action.
    // return new Promise( resolve => {
    //     setTimeout( () => {
    //         const itemsToDisplay = items
    //             // filter out the full list of all items to only those matching the query text.
    //             .filter( isItemMatching )
    //             // return 10 items max - needed for generic queries when the list may contain hundreds of elements.
    //             .slice( 0, 10 );

    //         resolve( itemsToDisplay );
    //     }, 100 );
    // } );

    return new Promise (resolve => {
        dspApiConnection.v2.search.doSearchByLabel(queryText, 0).subscribe(
            (response: ReadResourceSequence) => {
                const itemsToDisplay = [];
                response.resources.forEach(element => {
                    itemsToDisplay.push('#' + element.label);
                });
                console.log('itemsToDisplay: ', itemsToDisplay);

                resolve(itemsToDisplay);
            }
        );
    });
    // return dspApiConnection.v2.search.doSearchByLabel(
    //     queryText, 0).subscribe(
    //     (response: ReadResourceSequence) => {
    //         console.log(response.resources);
    //         const itemsToDisplay = [];
    //         response.resources.forEach(element => {
    //             itemsToDisplay.push(element.label);
    //         });
    //         console.log('itemsToDisplay: ', itemsToDisplay);
    //         return itemsToDisplay;
    //     }
    // );
}

// function getFeedItems(): string[] {
//     return ['@Barney', '@Lily', '@Marshall', '@Robin', '@Ted'];
// }

function MentionCustomization( editor ) {
    // the upcast converter will convert <a class="mention" href="" data-user-id="">
    // elements to the model 'mention' attribute.
    editor.conversion.for( 'upcast' ).elementToAttribute( {
        view: {
            name: 'a',
            key: 'data-mention',
            classes: 'mention',
            attributes: {
                href: true,
                'data-user-id': true
            }
        },
        model: {
            key: 'mention',
            value: viewItem => {
                // the mention feature expects that the mention attribute value
                // in the model is a plain object with a set of additional attributes.
                // in order to create a proper object, use the toMentionAttribute helper method:
                const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewItem, {
                    // add any other properties that you need.
                    link: viewItem.getAttribute( 'href' ),
                    userId: viewItem.getAttribute( 'data-user-id' )
                } );

                return mentionAttribute;
            }
        },
        converterPriority: 'high'
    } );

    // downcast the model 'mention' text attribute to a view <a> element.
    editor.conversion.for( 'downcast' ).attributeToElement( {
        model: 'mention',
        view: ( modelAttributeValue, { writer } ) => {
            // do not convert empty attributes (lack of value means no mention).
            if ( !modelAttributeValue ) {
                return;
            }

            return writer.createAttributeElement( 'a', {
                class: 'mention',
                'data-mention': modelAttributeValue.id,
                'data-user-id': modelAttributeValue.userId,
                'href': modelAttributeValue.link
            }, {
                // make mention attribute to be wrapped by other attribute elements.
                priority: 20,
                // prevent merging mentions together.
                id: modelAttributeValue.uid
            } );
        },
        converterPriority: 'high'
    } );
}

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
                    marker: '#',
                    feed: getFeedItems,
                    minimumCharacters: 3
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


