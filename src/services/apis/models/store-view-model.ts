import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class StoreViewModel {
    id!: string | undefined;
    name!: string | undefined;
    logoUrl!: string | undefined;
    slug!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, StoreViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): StoreViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreViewModel>(data, StoreViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

