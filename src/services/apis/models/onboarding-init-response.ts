import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingInitResponse {
    storeId!: string | undefined;
    slugName!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingInitResponse, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingInitResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingInitResponse>(data, OnboardingInitResponse, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

