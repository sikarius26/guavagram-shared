import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingPaymentSetupResponse {
    clientSecret!: string | undefined;
    transactionId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingPaymentSetupResponse, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingPaymentSetupResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingPaymentSetupResponse>(data, OnboardingPaymentSetupResponse, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

