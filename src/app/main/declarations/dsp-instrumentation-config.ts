export class DspInstrumentationConfig {
    constructor(
        public environment: string,
        public dataDog: DspDataDogConfig,
        public rollbar: DspRollbarConfig
    ) { }
}

export class DspDataDogConfig {
    constructor(
        public active: boolean,
        public applicationId: string,
        public clientToken: string,
        public site: string,
        public service: string
    ) { }
}

export class DspRollbarConfig {
    constructor(
        public active: boolean
    ) { }
}
