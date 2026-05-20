import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CampaignStatusEnum } from './campaign-status-enum';
import { CreatorPickCategoryEnum } from './creator-pick-category-enum';

export class CreatorCampaignViewModel {
    id!: string | undefined;
    storeId!: string | undefined;
    storeName!: string | undefined;
    storeLogoUrl!: string | undefined;
    pickTitle!: string | undefined;
    pickCategory!: CreatorPickCategoryEnum;
    startedAt!: Date;
    endedAt!: Date | undefined;
    status!: CampaignStatusEnum;
    metrics!: { bookings: number; codeRedemptions: number; views: number; earningsCents: number; rating?: number } | undefined;
    buyerReview!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorCampaignViewModel, {
                startedAt: { date: true },
                endedAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorCampaignViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorCampaignViewModel>(data, CreatorCampaignViewModel, {
            startedAt: { date: true },
            endedAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
