import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class MarketingStatsViewModel {
    activeCount!: number;
    pastCount!: number;
    totalSpentEur!: number;
    bookingsGenerated!: number;
    clicksGenerated!: number;
    avgCtrPct!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MarketingStatsViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MarketingStatsViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MarketingStatsViewModel>(data, MarketingStatsViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
