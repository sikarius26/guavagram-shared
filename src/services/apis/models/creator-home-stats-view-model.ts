import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CreatorHomeStatsViewModel {
    followers!: number;
    followersDelta7d!: number;
    pickClicks!: number;
    pickClicksDelta7d!: number;
    bookingsGenerated!: number;
    bookingsDelta7d!: number;
    ordersGenerated!: number;
    ordersDelta7d!: number;
    monthEarningsCents!: number;
    monthEarningsDelta!: number;
    weeklyBars!: number[] | undefined;
    weekDaysLabels!: string[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorHomeStatsViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorHomeStatsViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorHomeStatsViewModel>(data, CreatorHomeStatsViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
