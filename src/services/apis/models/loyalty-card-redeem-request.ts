import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class LoyaltyCardRedeemRequest {
    token!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, LoyaltyCardRedeemRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): LoyaltyCardRedeemRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<LoyaltyCardRedeemRequest>(data, LoyaltyCardRedeemRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

