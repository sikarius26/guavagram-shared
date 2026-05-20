import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class BaseSearchRequest {
    pageSize!: number | undefined;
    pageIdx!: number | undefined;
    orderBy!: string | undefined;
    orderByAscending!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BaseSearchRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BaseSearchRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BaseSearchRequest>(data, BaseSearchRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

