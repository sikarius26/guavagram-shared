import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class GamificationRedeemRequest {
    rewardId!: string;
    storeId!: string | undefined;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, GamificationRedeemRequest, {});
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): GamificationRedeemRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<GamificationRedeemRequest>(data, GamificationRedeemRequest, {});
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
