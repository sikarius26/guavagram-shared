import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrderItemViewModel } from './order-item-view-model';

export class MenuBundlePurchaseRequest {
    bundleId!: string | undefined;
    orderBundleId!: string | undefined;
    parentBundleId!: string | undefined;
    orderItems!: OrderItemViewModel[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuBundlePurchaseRequest, {
                orderItems: { arrayOf: OrderItemViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuBundlePurchaseRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuBundlePurchaseRequest>(data, MenuBundlePurchaseRequest, {
            orderItems: { arrayOf: OrderItemViewModel }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

