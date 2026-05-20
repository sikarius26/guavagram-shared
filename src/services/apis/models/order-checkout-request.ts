import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CheckoutRequest } from './checkout-request';

export class OrderCheckoutRequest extends CheckoutRequest {
    tipsAmount!: number;
    orderItemIds!: { [key: string]: number; } | undefined;
    hasPaymentSplit!: boolean;


    init(_data?: any, _mappings?: any) {
        super.init(_data);
        if (_data) {
            const mapped = dynamicFromJS(_data, OrderCheckoutRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OrderCheckoutRequest {
        data = typeof data === 'object' ? data : {};
        const parentInstance = CheckoutRequest.fromJS(data);
        const childInstance = dynamicFromJS<OrderCheckoutRequest>(data, OrderCheckoutRequest, {
        });
        // Assign children
        Object.assign(childInstance, parentInstance);
        return childInstance;
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

