import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class StoreSearchResultItemViewModel {


    init(_data?: any, _mappings?: any) {
    }

    static fromJS(
        data: any, _mappings?: any
    ): StoreSearchResultItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreSearchResultItemViewModel>(data, StoreSearchResultItemViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

