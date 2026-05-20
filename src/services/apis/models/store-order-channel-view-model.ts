import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrderTypeEnum } from './order-type-enum';

export class StoreOrderChannelViewModel {
    orderTypeId!: OrderTypeEnum;
    isOpen!: boolean;
    minOrderAmount!: number;
    packagingAndServicePrice!: number;
    forcePackagingAndService!: boolean;
    afterOrderMessage!: string | undefined;
    minNotificationTimeMinutes!: number | undefined;
    maxSchedulingTimeHours!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, StoreOrderChannelViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): StoreOrderChannelViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreOrderChannelViewModel>(data, StoreOrderChannelViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

