import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardVoucherTemplate {
    id!: string | undefined;
    displayName!: string | undefined;
    description!: string | undefined;
    defaultValue!: number | undefined;
    minAmount!: number | undefined;
    expireAt!: Date | undefined;
    maxCount!: number | undefined;
    isStackable!: boolean;
    cardBackgroundImageUrl!: string | undefined;
    cardLogoUrl!: string | undefined;
    cardPrimaryColor!: string | undefined;
    cardSecondaryColor!: string | undefined;
    cardTermsText!: string | undefined;
    showBalanceOnCard!: boolean;
    showExpiryOnCard!: boolean;
    showTermsOnCard!: boolean;
    walletPassEnabled!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardVoucherTemplate, {
                expireAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardVoucherTemplate {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardVoucherTemplate>(data, DashboardVoucherTemplate, {
            expireAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

