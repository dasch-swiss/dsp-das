import { Injectable } from '@angular/core';
import { Faro, initializeFaro, InternalLoggerLevel } from '@grafana/faro-web-sdk';

@Injectable({
  providedIn: 'root',
})
export class GrafanaFaroService {
  private faro: Faro;

  initializeFaro() {
    return;
    this.faro = initializeFaro({
      url: 'https://faro-collector-prod-eu-west-2.grafana.net/collect/',
      apiKey: '66166d1b81448a1cca47cde470d9ec98',
      app: {
        name: 'DSP-APP',
        version: '1.0.0',
        environment: 'development',
      },
      internalLoggerLevel: InternalLoggerLevel.VERBOSE, // Possible values are: OFF, ERROR, WARN, INFO, VERBOSE
    });
  }

  // Add any additional methods or functionalities related to Faro SDK here
}
