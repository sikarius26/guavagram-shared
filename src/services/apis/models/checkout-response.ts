import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CheckoutResponse {
    clientChallenge!: string | undefined;
    clientSecret!: string | undefined;
    receiptId!: string | undefined;
    referenceId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CheckoutResponse, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CheckoutResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CheckoutResponse>(data, CheckoutResponse, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

