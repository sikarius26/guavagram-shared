import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { ScheduleViewModel } from './schedule-view-model';

export class BookingOfferViewModel {
    id!: string | undefined;
    displayName!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;
    isRecurring!: boolean;
    maxGuests!: number | undefined;
    weeklySchedule!: { [key: string]: ScheduleViewModel[]; } | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BookingOfferViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BookingOfferViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BookingOfferViewModel>(data, BookingOfferViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

