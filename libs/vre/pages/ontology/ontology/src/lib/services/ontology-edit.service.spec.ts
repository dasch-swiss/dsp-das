import { TestBed } from '@angular/core/testing';
import type {
  ClassDefinition,
  KnoraApiConnection,
  ReadOntology,
  ResourceClassDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { LocalizationService, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { createMockLocalizationService } from '@dasch-swiss/vre/shared/app-helper-services/testing';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { PropertyInfo, ResourceClassInfo } from '../ontology.types';
import { OntologyEditService } from './ontology-edit.service';

/**
 * Focused spec for `assignPropertyToClass$`. The rest of the service is not
 * covered here — we only validate that the Observable variant:
 *   1. Forwards the correct `UpdateOntology` shape to dsp-js.
 *   2. Reloads the ontology on success and emits once.
 *   3. Propagates errors and still resets `_isTransacting`.
 *   4. With a drop index, moves the property there within one transaction.
 * plus `canAssignPropertyToClass`, which mirrors dsp-api's subject-class check.
 */
describe('OntologyEditService.assignPropertyToClass$', () => {
  let addCardinalitySpy: jest.Mock;
  let getOntologySpy: jest.Mock;
  let service: OntologyEditService;

  const ONTO_IRI = 'http://0.0.0.0:3333/ontology/0001/anything/v2';
  const LMD = '2026-05-12T10:00:00Z';
  const CLASS_IRI = `${ONTO_IRI}#Book`;
  const PROP_IRI = `${ONTO_IRI}#hasAuthor`;

  const stubOntology = (): ReadOntology =>
    ({
      id: ONTO_IRI,
      lastModificationDate: LMD,
      getAllClassDefinitions: () => [],
      getAllPropertyDefinitions: () => [],
      getClassDefinitionsByType: () => [],
      getPropertyDefinitionsByType: () => [],
    }) as unknown as ReadOntology;

  const stubClassDefinition = (guiOrders: (number | undefined)[] = []): ClassDefinition =>
    ({
      id: CLASS_IRI,
      propertiesList: guiOrders.map((g, i) => ({
        propertyIndex: `prop-${i}`,
        cardinality: 1,
        guiOrder: g,
      })),
    }) as unknown as ClassDefinition;

  let replaceGuiOrderSpy: jest.Mock;

  beforeEach(() => {
    addCardinalitySpy = jest.fn();
    getOntologySpy = jest.fn().mockReturnValue(of(stubOntology()));
    replaceGuiOrderSpy = jest.fn().mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        OntologyEditService,
        {
          provide: DspApiConnectionToken,
          useValue: {
            v2: {
              onto: {
                addCardinalityToResourceClass: addCardinalitySpy,
                replaceGuiOrderOfCardinalities: replaceGuiOrderSpy,
                getOntology: getOntologySpy,
                canDeleteOntology: jest.fn().mockReturnValue(of({ canDo: true })),
              },
            },
          } as unknown as KnoraApiConnection,
        },
        { provide: NotificationService, useValue: { openSnackBar: jest.fn() } },
        { provide: LocalizationService, useValue: createMockLocalizationService().service },
        { provide: OntologyService, useValue: { getInPreferedLanguage: () => '' } },
        {
          provide: ProjectPageService,
          useValue: {
            currentProject$: new BehaviorSubject({ id: 'p-1', shortcode: '0001' }),
            ontologies$: new BehaviorSubject<ReadOntology[]>([]),
            currentProject: { shortcode: '0001' },
          },
        },
        { provide: ListApiService, useValue: { listInProject: () => of({ lists: [] }) } },
        { provide: TranslateService, useValue: { instant: (k: string) => k } },
      ],
    });

    service = TestBed.inject(OntologyEditService);
    // Seed _currentOntology so ontologyId / ctx / lastModificationDate resolve.
    // Using bracket access avoids exposing private state in the public API.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, dot-notation
    (service as any)['_currentOntology'].next(stubOntology());
  });

  describe('happy path', () => {
    beforeEach(() => {
      addCardinalitySpy.mockReturnValue(of({ id: CLASS_IRI } as ResourceClassDefinitionWithAllLanguages));
    });

    it('emits once on success and reloads the ontology', done => {
      const emissions: unknown[] = [];
      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1, 2])).subscribe({
        next: v => emissions.push(v),
        complete: () => {
          expect(emissions).toEqual([undefined]);
          expect(addCardinalitySpy).toHaveBeenCalledTimes(1);
          expect(getOntologySpy).toHaveBeenCalledWith(ONTO_IRI, true);
          done();
        },
      });
    });

    it('computes guiOrder as max(existing) + 1', done => {
      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1, 5, 3])).subscribe({
        complete: () => {
          const sent = addCardinalitySpy.mock.calls[0][0];
          // UpdateOntology<UpdateResourceClassCardinality> — inspect the wrapped cardinality.
          const cardinalities = sent.entity.cardinalities;
          expect(cardinalities).toHaveLength(1);
          expect(cardinalities[0].propertyIndex).toBe(PROP_IRI);
          expect(cardinalities[0].guiOrder).toBe(6);
          expect(cardinalities[0].cardinality).toBe(1);
          done();
        },
      });
    });

    it('falls back to guiOrder = 1 when the class has no properties', done => {
      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([])).subscribe({
        complete: () => {
          const sent = addCardinalitySpy.mock.calls[0][0];
          expect(sent.entity.cardinalities[0].guiOrder).toBe(1);
          done();
        },
      });
    });

    it('resets _isTransacting to false after success', done => {
      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1])).subscribe({
        complete: () => {
          expect(service.isTransacting).toBe(false);
          done();
        },
      });
    });
  });

  describe('error path', () => {
    it('propagates the error to the subscriber', done => {
      const boom = new Error('boom');
      addCardinalitySpy.mockReturnValue(throwError(() => boom));

      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1])).subscribe({
        next: () => done.fail('expected error'),
        error: err => {
          expect(err).toBe(boom);
          done();
        },
      });
    });

    it('resets _isTransacting to false even on error', done => {
      addCardinalitySpy.mockReturnValue(throwError(() => new Error('boom')));

      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1])).subscribe({
        error: () => {
          // `finalize` runs as part of subscription teardown; checking on the
          // next microtask guarantees the reset has flushed.
          queueMicrotask(() => {
            expect(service.isTransacting).toBe(false);
            done();
          });
        },
      });
    });

    it('does not reload the ontology when addCardinality fails', done => {
      addCardinalitySpy.mockReturnValue(throwError(() => new Error('boom')));

      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1])).subscribe({
        error: () => {
          expect(getOntologySpy).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('with a drop index', () => {
    const classWithProperties = (...ids: string[]) =>
      ({
        id: CLASS_IRI,
        properties: ids.map((id, i) => ({
          propDef: { id },
          iHasProperty: { propertyIndex: id, cardinality: 1, guiOrder: i + 1 },
        })),
      }) as unknown as ResourceClassInfo;

    const reloadedClassIs = (resClass: ResourceClassInfo) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).currentOntologyClasses$ = of([resClass]);
    };

    beforeEach(() => {
      addCardinalitySpy.mockReturnValue(of({ id: CLASS_IRI } as ResourceClassDefinitionWithAllLanguages));
    });

    it('moves the appended property to the drop index', done => {
      reloadedClassIs(classWithProperties('prop-0', 'prop-1', PROP_IRI));

      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1, 2]), 1).subscribe({
        complete: () => {
          const sent = replaceGuiOrderSpy.mock.calls[0][0].entity.cardinalities;
          expect(sent.map((c: { propertyIndex: string; guiOrder: number }) => [c.propertyIndex, c.guiOrder])).toEqual([
            ['prop-0', 1],
            [PROP_IRI, 2],
            ['prop-1', 3],
          ]);
          expect(getOntologySpy).toHaveBeenCalledTimes(2);
          done();
        },
      });
    });

    it('stays transacting between the add and the reorder request', done => {
      reloadedClassIs(classWithProperties('prop-0', PROP_IRI));
      replaceGuiOrderSpy.mockImplementation(() => {
        expect(service.isTransacting).toBe(true);
        return of({});
      });

      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1]), 0).subscribe({
        complete: () => {
          expect(replaceGuiOrderSpy).toHaveBeenCalledTimes(1);
          expect(service.isTransacting).toBe(false);
          done();
        },
      });
    });

    it('skips the reorder when the property already landed at the drop index', done => {
      reloadedClassIs(classWithProperties('prop-0', PROP_IRI));

      service.assignPropertyToClass$(PROP_IRI, stubClassDefinition([1]), 1).subscribe({
        complete: () => {
          expect(replaceGuiOrderSpy).not.toHaveBeenCalled();
          // No reload resets the flag on this path; `finalize` does, after `complete`.
          queueMicrotask(() => {
            expect(service.isTransacting).toBe(false);
            done();
          });
        },
      });
    });
  });

  describe('canAssignPropertyToClass', () => {
    const PERSON_IRI = `${ONTO_IRI}#Person`;
    const AUTHOR_IRI = `${ONTO_IRI}#Author`;

    const ontologyWithClasses = (...classes: { id: string; subClassOf: string[] }[]) =>
      ({ ...stubOntology(), getClassDefinitionsByType: () => classes }) as unknown as ReadOntology;

    const property = (subjectType?: string) => ({ propDef: { id: PROP_IRI, subjectType } }) as unknown as PropertyInfo;

    const classDef = (id: string, subClassOf: string[]) => ({ id, subClassOf }) as unknown as ClassDefinition;

    beforeEach(() => {
      // The service reads the project ontologies once at construction, so seed its state directly.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, dot-notation
      (service as any)['_projectOntologiesSubject'].next([
        ontologyWithClasses(
          { id: PERSON_IRI, subClassOf: ['http://api.knora.org/ontology/knora-api/v2#Resource'] },
          { id: AUTHOR_IRI, subClassOf: [PERSON_IRI] },
          { id: CLASS_IRI, subClassOf: ['http://api.knora.org/ontology/knora-api/v2#Resource'] }
        ),
      ]);
    });

    it('allows a property without subjectType', () => {
      expect(service.canAssignPropertyToClass(property(), classDef(CLASS_IRI, []))).toBe(true);
    });

    it('allows the restricted class and its subclasses', () => {
      expect(service.canAssignPropertyToClass(property(PERSON_IRI), classDef(PERSON_IRI, []))).toBe(true);
      expect(service.canAssignPropertyToClass(property(PERSON_IRI), classDef(AUTHOR_IRI, [PERSON_IRI]))).toBe(true);
    });

    it('rejects a class outside the restricted class hierarchy', () => {
      const book = classDef(CLASS_IRI, ['http://api.knora.org/ontology/knora-api/v2#Resource']);
      expect(service.canAssignPropertyToClass(property(PERSON_IRI), book)).toBe(false);
    });

    it('leaves a subjectType outside the project ontologies to the server', () => {
      const book = classDef(CLASS_IRI, ['http://api.knora.org/ontology/knora-api/v2#Resource']);
      expect(
        service.canAssignPropertyToClass(property('http://api.knora.org/ontology/knora-api/v2#Resource'), book)
      ).toBe(true);
    });
  });
});
