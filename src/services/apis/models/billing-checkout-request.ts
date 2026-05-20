import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class BillingCheckoutRequest {
    platformPlanId!: string | undefined;
    isAnnualBilling!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BillingCheckoutRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BillingCheckoutRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BillingCheckoutRequest>(data, BillingCheckoutRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

