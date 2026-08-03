import { of } from 'rxjs';
import { MockList } from '../../test/data/api/v2/mock-list';
import { KnoraApiConfig } from '../knora-api-config';
import { KnoraApiConnection } from '../knora-api-connection';
import { ListNodeV2 } from '../models/v2/lists/list-node-v2';

describe('ListNodeV2Cache', () => {
  const config = new KnoraApiConfig('http', '0.0.0.0', 3333, '', '', true);
  let knoraApiConnection: KnoraApiConnection;

  let getNodeSpy: jest.SpyInstance;
  let getListSpy: jest.SpyInstance;

  beforeEach(() => {
    knoraApiConnection = new KnoraApiConnection(config);

    getNodeSpy = jest.spyOn(knoraApiConnection.v2.list, 'getNode').mockImplementation((nodeIri: string) => {
      return of(MockList.mockNode(nodeIri));
    });

    getListSpy = jest.spyOn(knoraApiConnection.v2.list, 'getList').mockImplementation((nodeIri: string) => {
      return of(MockList.mockList(nodeIri));
    });
  });

  afterEach(() => {
    getNodeSpy.mockRestore();
    getListSpy.mockRestore();
  });

  describe('Method getItem()', () => {
    it('should get a list node from the cache', done => {
      knoraApiConnection.v2.listNodeCache['getItem']('http://rdfh.ch/lists/0001/treeList01').subscribe(
        (node: ListNodeV2) => {
          expect(node.id).toEqual('http://rdfh.ch/lists/0001/treeList01');

          expect(getNodeSpy).toHaveBeenCalledTimes(1);
          expect(getNodeSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList01');

          expect(getListSpy).toHaveBeenCalledTimes(1);
          expect(getListSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList');

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList01']
          ).not.toBeUndefined();

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList']
          ).not.toBeUndefined(); // root node Iri is a dependency of each list node

          // since the test uses a sync Observable to retrieve the whole list, the information is present
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList02']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList03']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList10']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList11']
          ).not.toBeUndefined();

          done();
        }
      );
    });

    it('should get a list node from the cache several times asynchronously', done => {
      knoraApiConnection.v2.listNodeCache['getItem']('http://rdfh.ch/lists/0001/treeList01').subscribe(
        (node: ListNodeV2) => {
          expect(node.id).toEqual('http://rdfh.ch/lists/0001/treeList01');

          expect(getNodeSpy).toHaveBeenCalledTimes(1);
          expect(getNodeSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList01');

          expect(getListSpy).toHaveBeenCalledTimes(1);
          expect(getListSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList');

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList01']
          ).not.toBeUndefined();

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList']
          ).not.toBeUndefined(); // root node Iri is a dependency of each list node

          // since the test uses a sync Observable to retrieve the whole list, the information is present
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList02']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList03']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList10']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList11']
          ).not.toBeUndefined();
        }
      );

      knoraApiConnection.v2.listNodeCache['getItem']('http://rdfh.ch/lists/0001/treeList01').subscribe(
        (node: ListNodeV2) => {
          expect(node.id).toEqual('http://rdfh.ch/lists/0001/treeList01');

          expect(getNodeSpy).toHaveBeenCalledTimes(1);
          expect(getNodeSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList01');

          expect(getListSpy).toHaveBeenCalledTimes(1);
          expect(getListSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList');

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList01']
          ).not.toBeUndefined();

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList']
          ).not.toBeUndefined(); // root node Iri is a dependency of each list node

          // since the test uses a sync Observable to retrieve the whole list, the information is present
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList02']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList03']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList10']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList11']
          ).not.toBeUndefined();
        }
      );

      knoraApiConnection.v2.listNodeCache['getItem']('http://rdfh.ch/lists/0001/treeList01').subscribe(
        (node: ListNodeV2) => {
          expect(node.id).toEqual('http://rdfh.ch/lists/0001/treeList01');

          expect(getNodeSpy).toHaveBeenCalledTimes(1);
          expect(getNodeSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList01');

          expect(getListSpy).toHaveBeenCalledTimes(1);
          expect(getListSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList');

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList01']
          ).not.toBeUndefined();

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList']
          ).not.toBeUndefined(); // root node Iri is a dependency of each list node

          // since the test uses a sync Observable to retrieve the whole list, the information is present
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList02']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList03']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList10']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList11']
          ).not.toBeUndefined();
          done();
        }
      );
    });
  });

  describe('Method getNode()', () => {
    it('should get a list node from the cache', done => {
      knoraApiConnection.v2.listNodeCache
        .getNode('http://rdfh.ch/lists/0001/treeList01')
        .subscribe((node: ListNodeV2) => {
          expect(node.id).toEqual('http://rdfh.ch/lists/0001/treeList01');

          expect(getNodeSpy).toHaveBeenCalledTimes(1);
          expect(getNodeSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList01');

          expect(getListSpy).toHaveBeenCalledTimes(1);
          expect(getListSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList');

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList01']
          ).not.toBeUndefined();

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList']
          ).not.toBeUndefined(); // root node Iri is a dependency of each list node

          // since the test uses a sync Observable to retrieve the whole list, the information is present
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList02']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList03']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList10']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList11']
          ).not.toBeUndefined();

          done();
        });
    });
  });

  describe('Method getListNodes()', () => {
    it('should fetch the whole list once and return all of its nodes without a /v2/node request', done => {
      knoraApiConnection.v2.listNodeCache
        .getListNodes('http://rdfh.ch/lists/0001/treeList')
        .subscribe((nodes: ListNodeV2[]) => {
          // no per-leaf node request
          expect(getNodeSpy).not.toHaveBeenCalled();

          // one whole-list request, by root
          expect(getListSpy).toHaveBeenCalledTimes(1);
          expect(getListSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList');

          // all nodes are present, so a leaf label can be resolved locally
          const ids = nodes.map(node => node.id);
          expect(ids).toEqual(
            expect.arrayContaining([
              'http://rdfh.ch/lists/0001/treeList',
              'http://rdfh.ch/lists/0001/treeList01',
              'http://rdfh.ch/lists/0001/treeList03',
              'http://rdfh.ch/lists/0001/treeList10',
              'http://rdfh.ch/lists/0001/treeList11',
            ])
          );

          const leaf = nodes.find(node => node.id === 'http://rdfh.ch/lists/0001/treeList10');
          expect(leaf?.label).toEqual('Tree list node 10');

          done();
        });
    });

    it('should reuse the single fetch for repeated calls for the same root', done => {
      knoraApiConnection.v2.listNodeCache.getListNodes('http://rdfh.ch/lists/0001/treeList').subscribe(() => {
        knoraApiConnection.v2.listNodeCache.getListNodes('http://rdfh.ch/lists/0001/treeList').subscribe(() => {
          expect(getNodeSpy).not.toHaveBeenCalled();
          expect(getListSpy).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });

  describe('Method reloadCachedItem', () => {
    it('should reload the item in the cache', done => {
      knoraApiConnection.v2.listNodeCache['reloadCachedItem']('http://rdfh.ch/lists/0001/treeList01').subscribe(
        (node: ListNodeV2) => {
          expect(node.id).toEqual('http://rdfh.ch/lists/0001/treeList01');

          expect(getNodeSpy).toHaveBeenCalledTimes(1);
          expect(getNodeSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList01');

          expect(getListSpy).toHaveBeenCalledTimes(1);
          expect(getListSpy).toHaveBeenCalledWith('http://rdfh.ch/lists/0001/treeList');

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList01']
          ).not.toBeUndefined();

          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList']
          ).not.toBeUndefined(); // root node Iri is a dependency of each list node

          // since the test uses a sync Observable to retrieve the whole list, the information is present
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList02']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList03']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList10']
          ).not.toBeUndefined();
          expect(
            knoraApiConnection.v2.listNodeCache['cache']['http://rdfh.ch/lists/0001/treeList11']
          ).not.toBeUndefined();

          done();
        }
      );
    });
  });
});
