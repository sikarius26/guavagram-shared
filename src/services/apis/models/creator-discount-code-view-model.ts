import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CreatorDiscountCodeViewModel {
    code!: string | undefined;
    percentOff!: number | undefined;
    flatOffCents!: number | undefined;
    description!: string | undefined;
    storeId!: string | undefined;
    expireAt!: Date | undefined;
    usageCount!: number;
    maxUses!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorDiscountCodeViewModel, {
                expireAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorDiscountCodeViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorDiscountCodeViewModel>(data, CreatorDiscountCodeViewModel, {
            expireAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
