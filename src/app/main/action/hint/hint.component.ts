import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-hint',
    templateUrl: './hint.component.html',
    styleUrls: ['./hint.component.scss']
})
export class HintComponent implements OnInit {

    @Input() topic: string;

    content: string;

    documentation: string;

    constructor() { }

    ngOnInit(): void {
        this.content = this._getHint(this.topic);
    }

    /**
     * get correct hint depending on the topic
     * @param topic
     * @returns hint as html
     *
     * todo: the hint should be written in markdown in different languages. Maybe stored in docs.
     */
    private _getHint(topic: string): string {
        switch(topic) {
            case 'search':
                this.documentation = 'https://docs.dasch.swiss/DSP-APP/user-guide/data/#search-and-browse';
                return `<p>Use special syntax:</p>
                <ul>
                    <li>question mark<strong>?</strong> can be used as wildcard symbol for a single character.<br>
                        <code class="">Example: <i>be?r</i> will find <i>beer</i> but also <i>bear</i></code>
                    </li><br>
                    <li>asterisk<strong>*</strong> can be used as a wildcard symbol for zero, one or multiple characters.<br>
                        <code class="">Example: <i>b*r</i> will find <i>beer</i> but also <i>bear</i></code>
                    </li><br>
                    <li><strong>"</strong>quotation marks<strong>"</strong> searches for the whole pattern.<br>
                        <code class="">Example: <i>"Lorem ipsum"</i> will find texts with exact content <i>Lorem ipsum</i></code>
                    </li>
                </ul>`;
                break;

            default:
                return `There's no hint implemented for the topic <strong>${topic}<strong>.`;
        }
    }

}
