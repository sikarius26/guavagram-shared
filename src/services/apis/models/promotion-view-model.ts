import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class PromotionViewModel {
    id!: string | undefined;
    isFromStore!: boolean;
    discount!: number | undefined;
    applyAutomatically!: boolean;
    amount!: number | undefined;
    code!: string | undefined;
    minOrderAmount!: number | undefined;
    promptAfterSeconds!: number | undefined;
    hasPriority!: boolean;
    orderTypeId!: any | undefined;
    mediaUrl!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PromotionViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PromotionViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PromotionViewModel>(data, PromotionViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

