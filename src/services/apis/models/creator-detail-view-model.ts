import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CreatorLevelViewModel } from './creator-level-view-model';
import { CreatorBadgeViewModel } from './creator-badge-view-model';

export class CreatorDetailViewModel {
    handle!: string | undefined;
    name!: string | undefined;
    profileImageUrl!: string | undefined;
    city!: string | undefined;
    verified!: boolean;
    bio!: string | undefined;
    expertise!: string[] | undefined;
    languages!: string[] | undefined;
    basePriceEur!: number;
    rating!: number;
    reviewsCount!: number;
    completedCampaigns!: number;
    level!: CreatorLevelViewModel | undefined;
    badges!: CreatorBadgeViewModel[] | undefined;
    boostedUntil!: Date | undefined;
    responseTimeHours!: number | undefined;
    coverImageUrl!: string | undefined;
    portfolio!: { storeId: string; storeName: string; storeLogoUrl: string; campaignTitle: string; completedAt: Date }[] | undefined;
    testimonials!: { storeName: string; quote: string; rating: number }[] | undefined;
    stats!: { reach: number; engagement: number; storesCollaboratedCount: number } | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorDetailViewModel, {
                level: { model: CreatorLevelViewModel },
                badges: { arrayOf: CreatorBadgeViewModel },
                boostedUntil: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorDetailViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorDetailViewModel>(data, CreatorDetailViewModel, {
            level: { model: CreatorLevelViewModel },
            badges: { arrayOf: CreatorBadgeViewModel },
            boostedUntil: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
