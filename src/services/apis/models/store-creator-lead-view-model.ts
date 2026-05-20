import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { StoreCreatorLeadStatusEnum } from './store-creator-lead-status-enum';
import { CreatorLevelEnum } from './creator-level-enum';

export class StoreCreatorLeadCreatorViewModel {
    handle!: string | undefined;
    displayName!: string | undefined;
    profileImageUrl!: string | undefined;
    city!: string | undefined;
    verified!: boolean;
    followers!: number;
    rating!: number;
    level!: CreatorLevelEnum | undefined;

    init(_data?: any) {
        if (_data) Object.assign(this, dynamicFromJS(_data, StoreCreatorLeadCreatorViewModel));
    }

    static fromJS(data: any): StoreCreatorLeadCreatorViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreCreatorLeadCreatorViewModel>(data, StoreCreatorLeadCreatorViewModel);
    }

    toJSON() { return dynamicToJSON(this); }
}

export class StoreCreatorLeadViewModel {
    leadId!: string | undefined;
    creator!: StoreCreatorLeadCreatorViewModel | undefined;
    wishlistedAt!: Date;
    priority!: number;
    reason!: string | undefined;
    status!: StoreCreatorLeadStatusEnum;
    lastOfferedAt!: Date | undefined;
    offerCode!: string | undefined;
    offerExpireAt!: Date | undefined;

    init(_data?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, StoreCreatorLeadViewModel, {
                wishlistedAt: { date: true },
                lastOfferedAt: { date: true },
                offerExpireAt: { date: true },
                creator: { model: StoreCreatorLeadCreatorViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(data: any): StoreCreatorLeadViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreCreatorLeadViewModel>(data, StoreCreatorLeadViewModel, {
            wishlistedAt: { date: true },
            lastOfferedAt: { date: true },
            offerExpireAt: { date: true },
            creator: { model: StoreCreatorLeadCreatorViewModel },
        });
    }

    toJSON() { return dynamicToJSON(this); }
}
