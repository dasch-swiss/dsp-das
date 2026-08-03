import { listRootIriFromGuiAttributes } from './list-gui-attributes';

describe('listRootIriFromGuiAttributes', () => {
  it('extracts the root IRI from an hlist gui attribute', () => {
    expect(listRootIriFromGuiAttributes(['hlist=<http://rdfh.ch/lists/0001/treeList>'])).toEqual(
      'http://rdfh.ch/lists/0001/treeList'
    );
  });

  it('reads only the first gui attribute', () => {
    expect(listRootIriFromGuiAttributes(['hlist=<http://rdfh.ch/lists/0001/treeList>', 'something=<else>'])).toEqual(
      'http://rdfh.ch/lists/0001/treeList'
    );
  });

  it('returns undefined for an empty or missing array', () => {
    expect(listRootIriFromGuiAttributes([])).toBeUndefined();
    expect(listRootIriFromGuiAttributes(undefined)).toBeUndefined();
  });

  it('returns undefined when the attribute is not an hlist', () => {
    expect(listRootIriFromGuiAttributes(['size=80'])).toBeUndefined();
  });

  it('returns undefined when the hlist attribute is malformed', () => {
    expect(listRootIriFromGuiAttributes(['hlist=<http://rdfh.ch/lists/0001/treeList'])).toBeUndefined();
  });
});
