import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrderViewModel } from './order-view-model';

export class UpdateOrderInfoResponse {
    order!: OrderViewModel | undefined;
    requirePhoneVerification!: boolean;
    minOrderAmount!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UpdateOrderInfoResponse, {
                order: { model: OrderViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UpdateOrderInfoResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UpdateOrderInfoResponse>(data, UpdateOrderInfoResponse, {
            order: { model: OrderViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

