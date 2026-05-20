import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrdersAccountViewModel } from './orders-account-view-model';
import { BaseReceiptItemViewModel } from './base-receipt-item-view-model';
import { OrderViewModel } from './order-view-model';

export class ReceiptViewModel extends BaseReceiptItemViewModel {
    receiptMessage!: string | undefined;
    tipsAmount!: number;
    amount!: number;
    refundedAmount!: number;
    isPersonal!: boolean;
    discountAmount!: number;
    vatAmount!: number;
    order!: OrderViewModel | undefined;
    ordersAccount!: OrdersAccountViewModel | undefined;


    init(_data?: any, _mappings?: any) {
        super.init(_data);
        if (_data) {
            const mapped = dynamicFromJS(_data, ReceiptViewModel, {
                order: { model: OrderViewModel },
                ordersAccount: { model: OrdersAccountViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): ReceiptViewModel {
        data = typeof data === 'object' ? data : {};
        const parentInstance = BaseReceiptItemViewModel.fromJS(data);
        const childInstance = dynamicFromJS<ReceiptViewModel>(data, ReceiptViewModel, {
            order: { model: OrderViewModel },
            ordersAccount: { model: OrdersAccountViewModel }
        });
        // Assign children
        Object.assign(childInstance, parentInstance);
        return childInstance;
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

