import { triggerBlobDownload } from './download-file';

describe('triggerBlobDownload', () => {
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    // jsdom throws "Not implemented: navigation" on a real anchor click.
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();

    if (!window.URL.createObjectURL) window.URL.createObjectURL = jest.fn();
    if (!window.URL.revokeObjectURL) window.URL.revokeObjectURL = jest.fn();
    jest.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('clicks an anchor pointing at the blob, named with the given filename', () => {
    const blob = new Blob(['a,b\n1,2\n'], { type: 'text/csv;charset=utf-8' });

    triggerBlobDownload(blob, 'export.csv');

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const anchor = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('export.csv');
    expect(anchor.href).toBe('blob:mock-url');
  });

  it('revokes the object URL and leaves no anchor behind', () => {
    triggerBlobDownload(new Blob(['x']), 'export.csv');

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(document.body.querySelector('a')).toBeNull();
  });
});
