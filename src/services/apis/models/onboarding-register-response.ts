import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingRegisterResponse {
    storeId!: string | undefined;
    slugName!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingRegisterResponse, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingRegisterResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingRegisterResponse>(data, OnboardingRegisterResponse, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

