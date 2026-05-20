import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingLinkGoogleBusinessResponse {
    storeId!: string | undefined;
    slugName!: string | undefined;
    displayName!: string | undefined;
    addressLine1!: string | undefined;
    city!: string | undefined;
    phoneNumber!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingLinkGoogleBusinessResponse, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingLinkGoogleBusinessResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingLinkGoogleBusinessResponse>(data, OnboardingLinkGoogleBusinessResponse, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

