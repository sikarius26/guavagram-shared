import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingLinkGoogleBusinessRequest {
    googleBusinessId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingLinkGoogleBusinessRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingLinkGoogleBusinessRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingLinkGoogleBusinessRequest>(data, OnboardingLinkGoogleBusinessRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

