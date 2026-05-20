import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { GamificationRankEnum } from './gamification-rank-enum';

export class GamificationProfileViewModel {
    totalPoints!: number;
    availablePoints!: number;
    rank!: GamificationRankEnum;
    currentStreak!: number;
    longestStreak!: number;
    lastCheckIn!: Date | undefined;
    reviewCount!: number;
    referralCount!: number;
    nextRankPoints!: number;
    badgeIds!: string[];

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, GamificationProfileViewModel, {
                lastCheckIn: { date: true },
                badgeIds: { arrayOf: String as any },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): GamificationProfileViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<GamificationProfileViewModel>(data, GamificationProfileViewModel, {
            lastCheckIn: { date: true },
            badgeIds: { arrayOf: String as any },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
