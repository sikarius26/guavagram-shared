import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class UserAnalyticsViewModel {
    views!: number;
    clicks!: number;
    bookings!: number;
    orders!: number;
    revenue!: number;
    earningsPending!: number;
    earningsPaid!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserAnalyticsViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserAnalyticsViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserAnalyticsViewModel>(data, UserAnalyticsViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

