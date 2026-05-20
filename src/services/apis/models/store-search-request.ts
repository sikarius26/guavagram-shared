import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class StoreSearchRequest {


    init(_data?: any, _mappings?: any) {
    }

    static fromJS(
        data: any, _mappings?: any
    ): StoreSearchRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreSearchRequest>(data, StoreSearchRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

