import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrderStatusEnum } from './order-status-enum';
import { OrderTypeEnum } from './order-type-enum';

export class OrderListItemViewModel {
    id!: string | undefined;
    ordersAccountId!: string | undefined;
    orderNumber!: number | undefined;
    sentAt!: Date | undefined;
    statusId!: OrderStatusEnum;
    itemsCount!: number;
    orderTypeId!: OrderTypeEnum;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OrderListItemViewModel, {
                sentAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OrderListItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OrderListItemViewModel>(data, OrderListItemViewModel, {
            sentAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

