import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { ScheduleViewModel } from './schedule-view-model';

export class BookingShiftViewModel {
    id!: string | undefined;
    name!: string | undefined;
    isRecurring!: boolean;
    minGuests!: number | undefined;
    maxGuests!: number | undefined;
    intervalMinutes!: number;
    durationMinutes!: number;
    noticePeriodMinutes!: number;
    startDate!: Date | undefined;
    endDate!: Date | undefined;
    pricePerGuest!: number | undefined;
    pricePerTable!: number | undefined;
    maxTotalGuests!: number | undefined;
    weeklySchedule!: { [key: string]: ScheduleViewModel; } | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BookingShiftViewModel, {
                startDate: { date: true },
                endDate: { date: true },
                weeklySchedule: { dictionaryOf: ScheduleViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BookingShiftViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BookingShiftViewModel>(data, BookingShiftViewModel, {
            startDate: { date: true },
            endDate: { date: true },
            weeklySchedule: { dictionaryOf: ScheduleViewModel }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

