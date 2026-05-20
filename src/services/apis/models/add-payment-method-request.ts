import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class AddPaymentMethodRequest {


    init(_data?: any, _mappings?: any) {
    }

    static fromJS(
        data: any, _mappings?: any
    ): AddPaymentMethodRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<AddPaymentMethodRequest>(data, AddPaymentMethodRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

