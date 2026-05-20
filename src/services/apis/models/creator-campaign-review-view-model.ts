import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CreatorCampaignReviewViewModel {
    id!: string | undefined;
    reviewerStoreId!: string | undefined;
    reviewerStoreName!: string | undefined;
    reviewerStoreLogoUrl!: string | undefined;
    rating!: number;
    text!: string | undefined;
    createdAt!: Date;
    pickTitle!: string | undefined;
    pickId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorCampaignReviewViewModel, {
                createdAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorCampaignReviewViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorCampaignReviewViewModel>(data, CreatorCampaignReviewViewModel, {
            createdAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
