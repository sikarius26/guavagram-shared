import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class GamificationLeaderboardEntryViewModel {
    rank!: number;
    userId!: string;
    displayName!: string | undefined;
    avatarUrl!: string | undefined;
    points!: number;
    isCurrentUser!: boolean;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, GamificationLeaderboardEntryViewModel, {});
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): GamificationLeaderboardEntryViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<GamificationLeaderboardEntryViewModel>(data, GamificationLeaderboardEntryViewModel, {});
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
