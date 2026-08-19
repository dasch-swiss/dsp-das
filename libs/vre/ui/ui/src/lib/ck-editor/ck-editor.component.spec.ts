import { ElementRef } from '@angular/core';
import { CkEditorComponent } from './ck-editor.component';

/**
 * `onEditorReady` relocates the editor's floating UI into the dialog popover so
 * the link balloon shares its top layer (DEV-6997). These specs pin the two
 * things that regressed before: the routed page must be left alone, and only
 * *this* editor's container may move — never the shared `.ck-body-wrapper`.
 */
describe('CkEditorComponent floating UI relocation', () => {
  let sharedWrapper: HTMLElement;

  const createEditor = () => {
    const container = document.createElement('div');
    container.classList.add('ck-body');
    sharedWrapper.appendChild(container);
    return { container, editor: { ui: { view: { body: { _bodyCollectionContainer: container } } } } };
  };

  const componentFor = (host: HTMLElement) => new CkEditorComponent(new ElementRef(host));

  beforeEach(() => {
    document.body.innerHTML = '';
    sharedWrapper = document.createElement('div');
    sharedWrapper.classList.add('ck-body-wrapper');
    document.body.appendChild(sharedWrapper);
  });

  it('leaves the floating UI alone outside a dialog', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const { container, editor } = createEditor();

    componentFor(host).onEditorReady(editor);

    expect(container.parentElement).toBe(sharedWrapper);
  });

  it('moves the floating UI into the popover and lets it receive clicks', () => {
    const popover = document.createElement('div');
    popover.setAttribute('popover', 'manual');
    const host = document.createElement('div');
    popover.appendChild(host);
    document.body.appendChild(popover);
    const { container, editor } = createEditor();

    componentFor(host).onEditorReady(editor);

    expect(popover.contains(container)).toBe(true);
    expect((container.parentElement as HTMLElement).style.pointerEvents).toBe('auto');
  });

  it('moves only its own editor, leaving other editors untouched', () => {
    const popover = document.createElement('div');
    popover.setAttribute('popover', 'manual');
    const host = document.createElement('div');
    popover.appendChild(host);
    document.body.appendChild(popover);

    const other = createEditor();
    const mine = createEditor();

    componentFor(host).onEditorReady(mine.editor);

    expect(popover.contains(mine.container)).toBe(true);
    expect(other.container.parentElement).toBe(sharedWrapper);
    expect(sharedWrapper.isConnected).toBe(true);
  });

  it('removes the host it added when the component is destroyed', () => {
    const popover = document.createElement('div');
    popover.setAttribute('popover', 'manual');
    const host = document.createElement('div');
    popover.appendChild(host);
    document.body.appendChild(popover);
    const { container, editor } = createEditor();

    const component = componentFor(host);
    component.onEditorReady(editor);
    const addedHost = container.parentElement as HTMLElement;
    component.ngOnDestroy();

    expect(addedHost.isConnected).toBe(false);
  });
});
