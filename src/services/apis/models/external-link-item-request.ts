import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class ExternalLinkItemRequest {
    externalLinkTypeId!: number;
    value!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, ExternalLinkItemRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): ExternalLinkItemRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<ExternalLinkItemRequest>(data, ExternalLinkItemRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

