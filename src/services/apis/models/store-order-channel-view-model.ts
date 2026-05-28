import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrderTypeEnum } from './order-type-enum';

export class StoreOrderChannelViewModel {
    // Channel id — present when the backend has the Guava orders module
    // contracted for the store; absent for free Guavagram stores. The public
    // ServiceConfigModal uses this to discover which channels exist (and gate
    // its takeaway/delivery schedule editor behind "Activa pedidos en Guava"
    // when the channels haven't been created yet). dynamicFromJS drops fields
    // not declared here, so the bare declaration is what wires it through.
    id!: string | undefined;
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

