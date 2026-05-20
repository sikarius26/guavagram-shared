import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { VoucherRewardTypeEnum } from './voucher-reward-type-enum';

export class VoucherViewModel {
    id!: string | undefined;
    code!: string | undefined;
    displayName!: string | undefined;
    discountValue!: number | undefined;
    rewardTypeId!: VoucherRewardTypeEnum;
    validFrom!: Date;
    expireAt!: Date | undefined;
    isActive!: boolean;
    appleWalletUrl!: string | undefined;
    googleWalletUrl!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, VoucherViewModel, {
                validFrom: { date: true },
                expireAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): VoucherViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<VoucherViewModel>(data, VoucherViewModel, {
            validFrom: { date: true },
            expireAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

