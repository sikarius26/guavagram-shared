import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingRegisterRequest {
    googlePlaceId!: string | undefined;
    emailAddress!: string | undefined;
    phoneNumber!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingRegisterRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingRegisterRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingRegisterRequest>(data, OnboardingRegisterRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

