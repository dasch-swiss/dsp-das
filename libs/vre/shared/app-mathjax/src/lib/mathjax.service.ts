import { Injectable } from '@angular/core';

declare global {
  interface Window {
    MathJax: {
      typesetPromise: () => void;
      startup: {
        promise: Promise<any>;
      };
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class MathJaxService {
  private mathJaxLoaded: Promise<void>;

  private mathJax: any = {
    source: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js',
  };

  constructor() {
    this.mathJaxLoaded = this.loadMathJax().catch(err => {
      console.log('MathJax failed to load', err);
    });
  }

  // This method is used by the MathJaxDirective to check if MathJax is loaded
  public getMathJaxLoadedPromise(): Promise<void> {
    return this.mathJaxLoaded;
  }

  private async loadMathJax(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('loading MathJax');

      const script: HTMLScriptElement = document.createElement('script');
      script.type = 'text/javascript';
      script.src = this.mathJax.source;
      script.async = true;

      script.onload = () => {
        resolve('MathJax loaded');
      };

      script.onerror = () => {
        reject('Error loading MathJax');
      };

      document.head.appendChild(script); // Append the script to start loading it
    });
  }

  render() {
    window.MathJax.startup.promise.then(() => {
      console.log('Typesetting LaTex');
      window.MathJax.typesetPromise();
    });
  }
}
