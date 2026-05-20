import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OrdersAccountListItemViewModel {
    id!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OrdersAccountListItemViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OrdersAccountListItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OrdersAccountListItemViewModel>(data, OrdersAccountListItemViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

