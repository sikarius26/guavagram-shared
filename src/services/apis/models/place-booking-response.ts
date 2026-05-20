import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CheckoutResponse } from './checkout-response';
import { BookingViewModel } from './booking-view-model';

export class PlaceBookingResponse extends CheckoutResponse {
    booking!: BookingViewModel | undefined;


    init(_data?: any, _mappings?: any) {
        super.init(_data);
        if (_data) {
            const mapped = dynamicFromJS(_data, PlaceBookingResponse, {
                booking: { model: BookingViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PlaceBookingResponse {
        data = typeof data === 'object' ? data : {};
        const parentInstance = CheckoutResponse.fromJS(data);
        const childInstance = dynamicFromJS<PlaceBookingResponse>(data, PlaceBookingResponse, {
            booking: { model: BookingViewModel }
        });
        // Assign children
        Object.assign(childInstance, parentInstance);
        return childInstance;
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

