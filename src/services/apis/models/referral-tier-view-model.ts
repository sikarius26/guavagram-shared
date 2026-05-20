import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class ReferralTierViewModel {
    userId!: string;
    displayName!: string | undefined;
    avatarUrl!: string | undefined;
    tier!: number;
    referralCount!: number;
    totalPointsEarned!: number;
    joinedAt!: Date | undefined;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, ReferralTierViewModel, {
                joinedAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(data: any, _mappings?: any): ReferralTierViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<ReferralTierViewModel>(data, ReferralTierViewModel, {
            joinedAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
