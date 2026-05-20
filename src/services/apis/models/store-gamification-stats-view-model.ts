import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class StoreGamificationStatsViewModel {
    storeId!: string;
    totalPointsGenerated!: number;
    reviewCount!: number;
    referralCount!: number;
    averageRating!: number | undefined;
    topReviewerName!: string | undefined;
    weeklyPointsGenerated!: number;
    monthlyPointsGenerated!: number;
    customerEngagementScore!: number;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, StoreGamificationStatsViewModel, {});
            Object.assign(this, mapped);
        }
    }

    static fromJS(data: any, _mappings?: any): StoreGamificationStatsViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreGamificationStatsViewModel>(data, StoreGamificationStatsViewModel, {});
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
