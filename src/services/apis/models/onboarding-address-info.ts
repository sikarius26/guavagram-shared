import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingAddressInfo {
    addressLine1!: string | undefined;
    addressLine2!: string | undefined;
    city!: string | undefined;
    state!: string | undefined;
    postalCode!: string | undefined;
    countryId!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingAddressInfo, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingAddressInfo {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingAddressInfo>(data, OnboardingAddressInfo, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

