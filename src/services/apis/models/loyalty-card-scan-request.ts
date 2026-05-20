import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class LoyaltyCardScanRequest {
    token!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, LoyaltyCardScanRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): LoyaltyCardScanRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<LoyaltyCardScanRequest>(data, LoyaltyCardScanRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

