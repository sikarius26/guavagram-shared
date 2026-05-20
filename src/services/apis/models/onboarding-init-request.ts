import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingInitRequest {
    displayName!: string | undefined;
    currencyCode!: string | undefined;
    defaultLangCode!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingInitRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingInitRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingInitRequest>(data, OnboardingInitRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

