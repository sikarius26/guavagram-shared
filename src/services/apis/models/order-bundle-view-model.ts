import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OrderBundleViewModel {
    id!: string | undefined;
    orderId!: string | undefined;
    bundleId!: string | undefined;
    name!: string | undefined;
    price!: number;
    isRefunded!: boolean;
    count!: number;
    paidBySessionId!: string | undefined;
    parentBundleId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OrderBundleViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OrderBundleViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OrderBundleViewModel>(data, OrderBundleViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

