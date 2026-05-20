import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OnboardingAddressInfo } from './onboarding-address-info';

export class GoogleBusinessLocationViewModel {
    googleBusinessId!: string | undefined;
    name!: string | undefined;
    businessType!: string | undefined;
    formattedAddress!: string | undefined;
    placeId!: string | undefined;
    phoneNumber!: string | undefined;
    description!: string | undefined;
    websiteUrl!: string | undefined;
    address!: OnboardingAddressInfo | undefined;
    isValid!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, GoogleBusinessLocationViewModel, {
                address: { model: OnboardingAddressInfo },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): GoogleBusinessLocationViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<GoogleBusinessLocationViewModel>(data, GoogleBusinessLocationViewModel, {
            address: { model: OnboardingAddressInfo },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

