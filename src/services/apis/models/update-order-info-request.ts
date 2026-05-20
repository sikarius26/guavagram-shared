import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { AddressViewModel } from './address-view-model';
import { OrderTypeEnum } from './order-type-enum';
import { PhoneNumberViewModel } from './phone-number-view-model';

export class UpdateOrderInfoRequest {
    name!: string | undefined;
    scheduleFor!: Date | undefined;
    address!: AddressViewModel | undefined;
    orderTypeId!: OrderTypeEnum;
    phoneNumber!: PhoneNumberViewModel | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UpdateOrderInfoRequest, {
                scheduleFor: { date: true },
                address: { model: AddressViewModel },
                phoneNumber: { model: PhoneNumberViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UpdateOrderInfoRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UpdateOrderInfoRequest>(data, UpdateOrderInfoRequest, {
            scheduleFor: { date: true },
            address: { model: AddressViewModel },
            phoneNumber: { model: PhoneNumberViewModel }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

