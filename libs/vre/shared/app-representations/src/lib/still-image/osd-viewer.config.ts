import OpenSeadragon from 'openseadragon';

export const osdViewerConfig: OpenSeadragon.Options = {
  sequenceMode: false,
  showNavigator: true,
  showZoomControl: false,
  showFullPageControl: false,
  showHomeControl: false,
  navigatorPosition: 'ABSOLUTE' as const,
  navigatorTop: 'calc(100% - 136px)',
  navigatorLeft: 'calc(100% - 136px)',
  navigatorHeight: '120px',
  navigatorWidth: '120px',
  gestureSettingsMouse: {
    clickToZoom: false, // do not zoom in on click
    dblClickToZoom: true, // but zoom on double click
    flickEnabled: true, // perform a flick gesture to drag image
  },
  visibilityRatio: 1.0, // viewers focus limited to the image borders; no more cutting the image on zooming out
};
