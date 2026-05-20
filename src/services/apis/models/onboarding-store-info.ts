import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingStoreInfo {
    displayName!: string | undefined;
    addressLine1!: string | undefined;
    city!: string | undefined;
    postalCode!: string | undefined;
    countryCode!: string | undefined;
    phoneNumber!: string | undefined;
    googlePlaceId!: string | undefined;
    logoUrl!: string | undefined;
    hours!: string[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingStoreInfo, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingStoreInfo {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingStoreInfo>(data, OnboardingStoreInfo, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

