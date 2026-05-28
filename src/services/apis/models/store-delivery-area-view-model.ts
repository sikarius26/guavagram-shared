import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { PositionViewModel } from './position-view-model';

export class StoreDeliveryAreaViewModel {
    id!: string | undefined;
    jsonCoordinates!: PositionViewModel[] | undefined;
    name!: string | undefined;
    circleRadius!: number;
    estimatedMinutes!: number | undefined;
    deliveryFees!: number;
    minOrderAmount!: number;
    isCircleArea!: boolean;
    minOrderForFreeDelivery!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, StoreDeliveryAreaViewModel, {
                jsonCoordinates: { arrayOf: PositionViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): StoreDeliveryAreaViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreDeliveryAreaViewModel>(data, StoreDeliveryAreaViewModel, {
            jsonCoordinates: { arrayOf: PositionViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
