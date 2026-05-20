import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { GamificationActionTypeEnum } from './gamification-action-type-enum';

export class GamificationActionViewModel {
    id!: string;
    actionType!: GamificationActionTypeEnum;
    points!: number;
    multiplier!: number;
    totalPoints!: number;
    description!: string | undefined;
    storeId!: string | undefined;
    storeName!: string | undefined;
    createdAt!: Date | undefined;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, GamificationActionViewModel, {
                createdAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): GamificationActionViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<GamificationActionViewModel>(data, GamificationActionViewModel, {
            createdAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
