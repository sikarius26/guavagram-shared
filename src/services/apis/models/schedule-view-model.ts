import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class ScheduleViewModel {
    startingHour!: number | undefined;
    startingMinute!: number | undefined;
    endingHour!: number | undefined;
    endingMinute!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, ScheduleViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): ScheduleViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<ScheduleViewModel>(data, ScheduleViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

