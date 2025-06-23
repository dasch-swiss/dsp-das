import {
  Constants,
  CreateOntology,
  CreateResourceClass,
  CreateResourceProperty,
  IHasProperty,
  StringLiteral,
  UpdateOntology,
  UpdateOntologyMetadata,
  UpdateResourceClassCardinality,
  UpdateResourceClassComment,
  UpdateResourceClassLabel,
  UpdateResourcePropertyComment,
  UpdateResourcePropertyGuiElement,
  UpdateResourcePropertyLabel,
} from '@dasch-swiss/dsp-js';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { PropertyEditData } from '@dasch-swiss/vre/ontology/ontology-properties';
import { DefaultProperty } from '@dasch-swiss/vre/shared/app-helper-services';
import { CreateResourceClassData, UpdateResourceClassData } from '../ontology-form/ontology-form.type';
import { UpdateOntologyT } from '../ontology.types';

/** shared context every update needs */
export interface OntologyContext {
  id: string;
  lastModificationDate: string;
}

export interface ProjectContext {
  projectId: string;
  projectName: string;
}

export class MakeOntologyFor {
  private static wrapInUpdateOntology<T extends UpdateOntologyT>(ctx: OntologyContext, entity: T): UpdateOntology<T> {
    const o = new UpdateOntology<T>();
    o.id = ctx.id;
    o.lastModificationDate = ctx.lastModificationDate;
    o.entity = entity as T;
    return o;
  }

  // properties

  static createProperty(ctx: OntologyContext, data: PropertyEditData): UpdateOntology<CreateResourceProperty> {
    const create = this._buildCreateResourceProperty(data);
    return this.wrapInUpdateOntology(ctx, create);
  }

  private static _buildCreateResourceProperty(d: PropertyEditData): CreateResourceProperty {
    const c = new CreateResourceProperty();
    c.name = d.name;
    c.label = d.label;
    c.comment = d.comment;
    c.guiElement = d.propType.guiEle;
    c.subPropertyOf = [d.propType.subPropOf];

    if (d.guiAttribute) {
      c.guiAttributes = this._guiAttrFor(d.guiAttribute, d.propType);
    }

    const needsObjType = [Constants.HasLinkTo, Constants.IsPartOf].includes(d.propType.subPropOf);
    c.objectType = needsObjType
      ? (d.objectType ?? d.guiAttribute ?? d.propType.objectType ?? '')
      : (d.propType.objectType ?? '');

    return c;
  }

  private static _guiAttrFor(attr: string, p: DefaultProperty): string[] | undefined {
    switch (p.guiEle) {
      case Constants.GuiColorPicker:
        return [`ncolors=${attr}`];
      case Constants.GuiList:
      case Constants.GuiPulldown:
      case Constants.GuiRadio:
        return [`hlist=<${attr}>`];
      case Constants.GuiSimpleText:
        return [`maxlength=${attr}`];
      case Constants.GuiSpinbox:
        return [`min=${attr}`, `max=${attr}`];
      case Constants.GuiTextarea:
        return ['width=100%'];
      default:
        return undefined;
    }
  }

  static buildResourceClassCardinality(classId: string, cardinalities: IHasProperty[]): UpdateResourceClassCardinality {
    const upd = new UpdateResourceClassCardinality();
    upd.id = classId;
    upd.cardinalities = cardinalities;
    return upd;
  }

  static updateResourceClassCardinality(ctx: OntologyContext, classId: string, cardinalities: IHasProperty[]) {
    return this.wrapInUpdateOntology(ctx, this.buildResourceClassCardinality(classId, cardinalities));
  }

  static updatePropertyLabel(ctx: OntologyContext, id: string, labels: StringLiteral[] | StringLiteralV2[]) {
    const upd: UpdateResourcePropertyLabel = { id, labels } as UpdateResourcePropertyLabel;
    return this.wrapInUpdateOntology(ctx, upd);
  }

  static updatePropertyComment(ctx: OntologyContext, id: string, comments: StringLiteral[] | StringLiteralV2[]) {
    const upd: UpdateResourcePropertyComment = { id, comments } as UpdateResourcePropertyComment;
    return this.wrapInUpdateOntology(ctx, upd);
  }

  static updatePropertyGuiElement(ctx: OntologyContext, id: string, guiElement: string) {
    const upd: UpdateResourcePropertyGuiElement = { id, guiElement } as UpdateResourcePropertyGuiElement;
    return this.wrapInUpdateOntology(ctx, upd);
  }

  // classes

  static createResourceClass(
    ctx: OntologyContext,
    { name, labels, comments }: CreateResourceClassData
  ): UpdateOntology<CreateResourceClass> {
    const create = {
      name,
      label: labels,
      comment: comments,
      subClassOf: [ctx.id],
    } as CreateResourceClass;

    return this.wrapInUpdateOntology(ctx, create);
  }

  static updateClassLabel(ctx: OntologyContext, id: string, labels: StringLiteral[] | StringLiteralV2[]) {
    const upd: UpdateResourceClassLabel = { id, labels } as UpdateResourceClassLabel;
    return this.wrapInUpdateOntology(ctx, upd);
  }

  static updateClassComment(ctx: OntologyContext, id: string, comments: StringLiteral[] | StringLiteralV2[]) {
    const upd: UpdateResourceClassComment = { id, comments } as UpdateResourceClassComment;
    return this.wrapInUpdateOntology(ctx, upd);
  }

  // ontologies

  static createOntology(name: string, label: string, comment: string, attachedToProject: string): CreateOntology {
    return {
      name,
      label,
      comment,
      attachedToProject: '',
    } as CreateOntology;
  }

  static updateOntologyMetadata(ctx: OntologyContext, label: string, comment: string): UpdateOntologyMetadata {
    return {
      id: ctx.id,
      label,
      comment,
      lastModificationDate: ctx.lastModificationDate,
    } as UpdateOntologyMetadata;
  }
}
