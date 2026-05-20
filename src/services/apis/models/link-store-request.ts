import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class LinkStoreRequest {
    storeId!: string | undefined;
    weight!: number;
    personalPick!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, LinkStoreRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): LinkStoreRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<LinkStoreRequest>(data, LinkStoreRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

