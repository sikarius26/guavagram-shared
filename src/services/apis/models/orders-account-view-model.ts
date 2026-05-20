import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { ReceiptViewModel } from './receipt-view-model';
import { OrderViewModel } from './order-view-model';

export class OrdersAccountViewModel {
    id!: string | undefined;
    guests!: string[] | undefined;
    hasMoneySplit!: boolean;
    total!: number;
    amountPaid!: number;
    leftToPay!: number;
    pendingOrdersCount!: number;
    receipts!: ReceiptViewModel[] | undefined;
    unacceptedOrdersCount!: number;
    totalItems!: number;
    orders!: OrderViewModel[] | undefined;
    closedAt!: Date | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OrdersAccountViewModel, {
                receipts: { arrayOf: ReceiptViewModel },
                orders: { arrayOf: OrderViewModel },
                closedAt: { date: true }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OrdersAccountViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OrdersAccountViewModel>(data, OrdersAccountViewModel, {
            receipts: { arrayOf: ReceiptViewModel },
            orders: { arrayOf: OrderViewModel },
            closedAt: { date: true }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

