import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardVoucherCard {
    id!: string | undefined;
    cardNumber!: string | undefined;
    originalValue!: number;
    balance!: number;
    issuerNotes!: string | undefined;
    createdAt!: Date;
    voucherId!: string | undefined;
    appleWalletPassUrl!: string | undefined;
    googleWalletPassUrl!: string | undefined;
    qrCodeData!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardVoucherCard, {
                createdAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardVoucherCard {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardVoucherCard>(data, DashboardVoucherCard, {
            createdAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

