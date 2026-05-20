import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrderItemViewModel } from './order-item-view-model';

export class MenuItemPurchaseRequest {
    orderItem!: OrderItemViewModel | undefined;
    recommendedItems!: { [key: string]: number; } | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuItemPurchaseRequest, {
                orderItem: { model: OrderItemViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuItemPurchaseRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuItemPurchaseRequest>(data, MenuItemPurchaseRequest, {
            orderItem: { model: OrderItemViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

