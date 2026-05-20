import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class UserProfileStatsViewModel {
    storesCount!: number;
    viewsCount!: number | undefined;
    clicksCount!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserProfileStatsViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserProfileStatsViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserProfileStatsViewModel>(data, UserProfileStatsViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

