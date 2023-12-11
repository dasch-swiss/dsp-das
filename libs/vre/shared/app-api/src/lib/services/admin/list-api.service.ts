import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from '../base-api';
import {
    ChildNodeInfoResponse,
    CreateChildNodeRequest,
    CreateGroupRequest,
    CreateListRequest,
    DeleteChildNodeCommentsResponse,
    DeleteListNodeResponse,
    DeleteListResponse, ListChildNodeResponse,
    ListInfoResponse,
    ListNodeInfoResponse,
    ListResponse,
    ListsResponse, RepositionChildNodeRequest, RepositionChildNodeResponse,
    UpdateChildNodeCommentsRequest,
    UpdateChildNodeLabelsRequest,
    UpdateChildNodeNameRequest, UpdateChildNodeRequest,
    UpdateGroupRequest,
    UpdateListInfoRequest
} from '@dasch-swiss/dsp-js';
import { map } from 'rxjs/operators';
import { ListNodeResponse } from '@dasch-swiss/dsp-js/src/models/admin/list-node-response';

@Injectable({
    providedIn: 'root'
})
export class ListApiService extends BaseApi {
    constructor(private _http: HttpClient) {
        super('admin/lists');
    }

    list() {
        return this._http.get<ListsResponse>(this.baseUri);
    }

    get(listIri: string) {
        return this._http.get<ListResponse | ListChildNodeResponse>(`${this.baseUri}/${listIri}`);
    }

    create(list: CreateListRequest) {
        return this._http.post<ListResponse>(this.baseUri, list);
    }

    update(iri: string, updatedGroup: UpdateGroupRequest) {
        return this._http.put<ListsResponse>(this._listRoute(iri), updatedGroup);
    }

    delete(iri: string) {
        return this._http.delete<DeleteListResponse | DeleteListNodeResponse>(this._listRoute(iri));
    }


    listInProject(projectIri: string) { // TODO pattern does not match the rest  of api
        return this._http.get<ListsResponse>(`${this.baseUri}/?projectIri=${encodeURIComponent(projectIri)}`);
    }

    getInfo(iri: string) {
        return this._http.get<ListInfoResponse>(`${this.baseUri}/infos/${encodeURIComponent(iri)}`); // TODO pattern does not match the rest of the api
    }

    getNodeInfo(iri: string) {
        return this._http.get<ListNodeInfoResponse>(`${this._listRoute(iri)}/info}`);
    }

    updateInfo(iri: string, updatedList: UpdateListInfoRequest) {
        return this._http.put<ListInfoResponse>(this._listRoute(iri), updatedList);
    }
    updateChildName(iri: string, updatedChildNodeName: UpdateChildNodeNameRequest) {
        return this._http.put<ChildNodeInfoResponse>(`${this._listRoute(iri)}/name`, updatedChildNodeName);
    }

    updateChildLabels(iri: string, labels: UpdateChildNodeLabelsRequest) {
        return this._http.put<ChildNodeInfoResponse>(`${this._listRoute(iri)}/labels`, labels);
    }

    updateChildComments(iri: string, comments: UpdateChildNodeCommentsRequest) {
        return this._http.put<ChildNodeInfoResponse>(`${this._listRoute(iri)}/comments`, comments);
    }

    deleteChildComments(iri: string) { // TODO route should rather be /lists/ID/comments
        return this._http.delete<DeleteChildNodeCommentsResponse>(`${this.baseUri}/comments/${encodeURIComponent(iri)}`);
    }

    createChildNode(parentNodeIri: string, node: CreateChildNodeRequest) {
        return this._http.post<ListNodeInfoResponse>(this._listRoute(parentNodeIri), node);
    }



    updateChildNodePosition(iri: string, repositionRequest: RepositionChildNodeRequest) {
        return this._http.put<RepositionChildNodeResponse>(`${this._listRoute(iri)}/position`, repositionRequest);
    }

    updateChildNode(iri: string, updatedNode: UpdateChildNodeRequest) {
        // TODO this uses normal update endpoint. throwing an error here seems like bad api pattern.
        if (updatedNode.name === undefined && updatedNode.labels === undefined && updatedNode.comments === undefined) {
            throw new Error("At least one property is expected from the following properties: name, labels, comments.");
        }
        return this._http.put<ChildNodeInfoResponse>(this._listRoute(iri), updatedNode);
    }

    repositionChildNode(iri: string, repositionRequest: RepositionChildNodeRequest){
        return this._http.put<RepositionChildNodeResponse>(`${this._listRoute(iri)}/position`, repositionRequest);
    }

    deleteListNode(iri: string) {
        return this._http.delete<DeleteListNodeResponse>(this._listRoute(iri));
}


    private _listRoute(iri: string) {
        return `${this.baseUri}/${encodeURIComponent(iri)}`;
    }
}