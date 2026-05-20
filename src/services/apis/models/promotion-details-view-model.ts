import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { StoreInfoViewModel } from './store-info-view-model';
import { VoucherViewModel } from './voucher-view-model';
import { VoucherDeliveryTypeEnum } from './voucher-delivery-type-enum';
import { CampaignRedeemMechanicTypeEnum } from './campaign-redeem-mechanic-type-enum';

export class PromotionDetailsViewModel {
    id!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;
    mediaUrl!: string | undefined;
    discount!: number | undefined;
    amount!: number | undefined;
    code!: string | undefined;
    minOrderAmount!: number | undefined;
    applyAutomatically!: boolean;
    hasPriority!: boolean;
    orderTypeId!: any | undefined;
    store!: StoreInfoViewModel | undefined;
    generatedVoucher!: VoucherViewModel | undefined;
    metaPixelId!: string | undefined;
    voucherDeliveryTypeId!: VoucherDeliveryTypeEnum;
    redeemMechanicTypeId!: CampaignRedeemMechanicTypeEnum | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PromotionDetailsViewModel, {
                store: { model: StoreInfoViewModel },
                generatedVoucher: { model: VoucherViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PromotionDetailsViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PromotionDetailsViewModel>(data, PromotionDetailsViewModel, {
            store: { model: StoreInfoViewModel },
            generatedVoucher: { model: VoucherViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

