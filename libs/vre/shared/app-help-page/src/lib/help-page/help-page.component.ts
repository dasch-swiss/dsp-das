import { Component, Inject, OnInit } from '@angular/core';
import { HealthResponse, KnoraApiConnection, VersionResponse } from '@dasch-swiss/dsp-js';
import { AppConfigService, DspApiConnectionToken, DspConfig } from '@dasch-swiss/vre/core/config';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import packageJson from '../../../../../../../package.json';
import { GridItem } from '../grid/grid.component';

@Component({
  selector: 'app-help',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.scss'],
})
export class HelpPageComponent implements OnInit {
  loading = true;

  dsp: DspConfig;
  releaseNotesUrl: string;

  appVersion: string = packageJson.version;
  apiStatus: HealthResponse;
  apiVersion: VersionResponse;

  docs: GridItem[] = [
    {
      icon: 'assignment',
      title: 'Project administration',
      text: 'Read more about project administration and how to manage project members.',
      url: 'https://docs.dasch.swiss/latest/DSP-APP/user-guide/project',
      urlText: 'Open Documentation',
    },
    {
      icon: 'bubble_chart',
      title: 'Data model creation',
      text: 'Find everything about data modelling and how to setup the project database.',
      url: 'https://docs.dasch.swiss/latest/DSP-APP/user-guide/project/#data-model',
      urlText: 'Open Documentation',
    },
    {
      icon: 'image_search',
      title: 'Research tools',
      text: 'Get more information about data handling, search methods and how to use the research tools.',
      url: 'https://docs.dasch.swiss/latest/DSP-APP/user-guide/',
      urlText: 'Open Documentation',
    },
  ];

  tools: GridItem[] = [
    {
      title: 'DSP-APP ',
      text: "This is the tool of the user interface you are using right now. DaSCH's generic web application.",
      url: 'https://github.com/dasch-swiss/dsp-app/releases/tag/v',
      urlText: 'Release notes',
    },
    {
      title: 'DSP-API ',
      text: 'Framework to store, share, and work with primary resources in the humanities.',
      url: 'https://github.com/dasch-swiss/dsp-api/releases/tag/',
      urlText: 'Release notes',
    },
    {
      title: 'Sipi ',
      text: 'High-performance, IIIF compatible media storage server.',
      url: 'https://github.com/dasch-swiss/sipi/releases/tag/',
      urlText: 'Release notes',
    },
  ];

  support: GridItem[] = [
    {
      title: 'Need more help?',
      text: 'Have you had some issues by using our software? Let us know and get in contact with the developers:',
      url: encodeURI('mailto:support@dasch.swiss?subject=DSP-APP request | '),
      urlText: 'Contact us',
    },
    {
      title: 'DaSCH Infrastructure',
      text: 'Wondering what the Swiss National Data and Service Center for the Humanities DaSCH exactly is? Get more information on our Website:',
      url: 'https://dasch.swiss',
      urlText: 'dasch.swiss',
    },
    {
      title: 'Contribute',
      text: 'All our software code is open source and accessible on Github. If you want to improve the tools, feel free to contact us on:',
      url: 'https://github.com/dasch-swiss',
      urlText: 'Github',
    },
  ];

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _appConfigService: AppConfigService
  ) {}

  ngOnInit() {
    this.dsp = this._appConfigService.dspConfig;

    this.support[0].url += `${this.dsp.environment}: ${this.dsp.release}`;

    this.releaseNotesUrl = `https://github.com/dasch-swiss/dsp-das/releases/tag/v${this.appVersion}`;

    this._dspApiConnection.system.versionEndpoint.getVersion().subscribe(response => {
      this.apiVersion = response.body;

      // set dsp-app version
      this.tools[0].title += this.appVersion;
      this.tools[0].url += this.appVersion;

      // set dsp-api version
      this.tools[1].title += this.apiVersion.webapi;
      this.tools[1].url += this.apiVersion.webapi.split('-')[0];

      // set dsp-sipi version
      this.tools[2].title += this.apiVersion.sipi;
      this.tools[2].url += this.apiVersion.sipi;
    });
  }
}
