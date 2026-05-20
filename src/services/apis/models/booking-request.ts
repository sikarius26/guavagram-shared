import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { PaymentInfoViewModel } from './payment-info-view-model';

export class BookingRequest {
    seats!: number;
    date!: Date;
    shiftId!: string | undefined;
    notes!: string | undefined;
    tableGroupId!: string | undefined;
    tableId!: string | undefined;
    name!: string | undefined;
    surname!: string | undefined;
    phoneNumber!: string | undefined;
    phoneDialCode!: string | undefined;
    email!: string | undefined;
    paymentInfo!: PaymentInfoViewModel | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BookingRequest, {
                date: { date: true },
                paymentInfo: { model: PaymentInfoViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BookingRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BookingRequest>(data, BookingRequest, {
            date: { date: true },
            paymentInfo: { model: PaymentInfoViewModel }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

