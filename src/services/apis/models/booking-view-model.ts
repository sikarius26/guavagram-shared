import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { BookingStatusEnum } from './booking-status-enum';
import { ReviewViewModel } from './review-view-model';

export class BookingViewModel {
    id!: string | undefined;
    startDate!: Date;
    guestsNumber!: number;
    shiftId!: string | undefined;
    statusId!: BookingStatusEnum;
    parentBookingId!: string | undefined;
    rescheduledBookingId!: string | undefined;
    review!: ReviewViewModel | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BookingViewModel, {
                startDate: { date: true },
                review: { model: ReviewViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BookingViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BookingViewModel>(data, BookingViewModel, {
            startDate: { date: true },
            review: { model: ReviewViewModel }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

