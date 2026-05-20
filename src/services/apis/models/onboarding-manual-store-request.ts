import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CountryEnum } from './country-enum';

export class OnboardingManualStoreRequest {
    displayName!: string | undefined;
    addressLine1!: string | undefined;
    city!: string | undefined;
    postalCode!: string | undefined;
    countryId!: CountryEnum | undefined;
    phoneNumber!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingManualStoreRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingManualStoreRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingManualStoreRequest>(data, OnboardingManualStoreRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

