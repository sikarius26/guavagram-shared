import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CampaignStatusEnum } from './campaign-status-enum';

export class CampaignViewModel {
    id!: string | undefined;
    creatorHandle!: string | undefined;
    creatorName!: string | undefined;
    creatorImageUrl!: string | undefined;
    pickTitle!: string | undefined;
    pickId!: string | undefined;
    status!: CampaignStatusEnum;
    startDate!: Date;
    endDate!: Date | undefined;
    brief!: string | undefined;
    totalCostEur!: number;
    metrics!: { bookings: number; clicks: number; redemptions: number; roiPct: number } | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CampaignViewModel, {
                startDate: { date: true },
                endDate: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CampaignViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CampaignViewModel>(data, CampaignViewModel, {
            startDate: { date: true },
            endDate: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
