import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class ChallengeViewModel {
    id!: string;
    title!: string;
    description!: string | undefined;
    iconName!: string | undefined;
    targetCount!: number;
    currentCount!: number;
    rewardPoints!: number;
    type!: 'weekly' | 'monthly';
    isCompleted!: boolean;
    expiresAt!: Date | undefined;
    badgeId!: string | undefined;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, ChallengeViewModel, { expiresAt: { date: true } });
            Object.assign(this, mapped);
        }
    }

    static fromJS(data: any, _mappings?: any): ChallengeViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<ChallengeViewModel>(data, ChallengeViewModel, { expiresAt: { date: true } });
    }

    toJSON() { return dynamicToJSON(this); }
}
