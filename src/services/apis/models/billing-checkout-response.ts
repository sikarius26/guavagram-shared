import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class BillingCheckoutResponse {
    url!: string | undefined;
    sessionId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BillingCheckoutResponse, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BillingCheckoutResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BillingCheckoutResponse>(data, BillingCheckoutResponse, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

