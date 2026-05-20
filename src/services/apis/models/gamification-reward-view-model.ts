import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { VoucherRewardTypeEnum } from './voucher-reward-type-enum';

export class GamificationRewardViewModel {
    id!: string;
    name!: string;
    description!: string | undefined;
    costPoints!: number;
    rewardType!: VoucherRewardTypeEnum;
    discountValue!: number | undefined;
    iconName!: string | undefined;
    isAvailable!: boolean;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, GamificationRewardViewModel, {});
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): GamificationRewardViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<GamificationRewardViewModel>(data, GamificationRewardViewModel, {});
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
