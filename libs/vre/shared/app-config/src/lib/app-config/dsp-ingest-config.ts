/**
 * configuration to instantiate the iiif url.
 *
 * @category Config
 */
export class DspIngestfConfig {
  static readonly DSP_INGEST_URL = 'http://localhost:3340';

  constructor(public dspIngestUrl: string) {}

  get url(): string {
    return this.dspIngestUrl;
  }
}
