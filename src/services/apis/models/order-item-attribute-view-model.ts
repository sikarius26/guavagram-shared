import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OrderItemAttributeViewModel {
    id!: string | undefined;
    menuItemAttributeGroupId!: string | undefined;
    menuItemAttributeId!: string | undefined;
    price!: number | undefined;
    name!: string | undefined;
    count!: number;
    isVariant!: boolean;
    isRefunded!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OrderItemAttributeViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OrderItemAttributeViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OrderItemAttributeViewModel>(data, OrderItemAttributeViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

