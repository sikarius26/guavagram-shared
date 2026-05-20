import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardVoucherRedeemRequest {
    cardNumber!: string | undefined;
    amount!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardVoucherRedeemRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardVoucherRedeemRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardVoucherRedeemRequest>(data, DashboardVoucherRedeemRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

