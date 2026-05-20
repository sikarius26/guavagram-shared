import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class StoreProfileViewModel {
    accentColor!: string | undefined;
    useDarkMode!: boolean;
    googlePlaceId!: string | undefined;
    description!: string | undefined;
    phoneNumber!: string | undefined;
    brandingSettings!: any | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, StoreProfileViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): StoreProfileViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreProfileViewModel>(data, StoreProfileViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

