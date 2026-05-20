import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { BaseReceiptItemViewModel } from './base-receipt-item-view-model';
import { OrderListItemViewModel } from './order-list-item-view-model';
import { OrdersAccountListItemViewModel } from './orders-account-list-item-view-model';

export class ReceiptListItemViewModel extends BaseReceiptItemViewModel {
    order!: OrderListItemViewModel | undefined;
    ordersAccount!: OrdersAccountListItemViewModel | undefined;


    init(_data?: any, _mappings?: any) {
        super.init(_data);
        if (_data) {
            const mapped = dynamicFromJS(_data, ReceiptListItemViewModel, {
                order: { model: OrderListItemViewModel },
                ordersAccount: { model: OrdersAccountListItemViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): ReceiptListItemViewModel {
        data = typeof data === 'object' ? data : {};
        const parentInstance = BaseReceiptItemViewModel.fromJS(data);
        const childInstance = dynamicFromJS<ReceiptListItemViewModel>(data, ReceiptListItemViewModel, {
            order: { model: OrderListItemViewModel },
            ordersAccount: { model: OrdersAccountListItemViewModel }
        });
        // Assign children
        Object.assign(childInstance, parentInstance);
        return childInstance;
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

