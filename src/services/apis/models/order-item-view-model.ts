import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrderItemAttributeViewModel } from './order-item-attribute-view-model';

export class OrderItemViewModel {
    menuItemId!: string | undefined;
    id!: string | undefined;
    name!: string | undefined;
    price!: number;
    notes!: string | undefined;
    categoryId!: string | undefined;
    bundleId!: string | undefined;
    orderCourseId!: string | undefined;
    attributes!: OrderItemAttributeViewModel[] | undefined;
    count!: number;
    isRefunded!: boolean;
    paidBySessionId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OrderItemViewModel, {
                attributes: { arrayOf: OrderItemAttributeViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OrderItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OrderItemViewModel>(data, OrderItemViewModel, {
            attributes: { arrayOf: OrderItemAttributeViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

