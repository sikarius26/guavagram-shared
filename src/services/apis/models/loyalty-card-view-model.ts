import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class LoyaltyCardViewModel {
    customerId!: string | undefined;
    storeId!: string | undefined;
    stamps!: number;
    stampsRequired!: number;
    isComplete!: boolean;
    completedCardsCount!: number;
    qrToken!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, LoyaltyCardViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): LoyaltyCardViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<LoyaltyCardViewModel>(data, LoyaltyCardViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

