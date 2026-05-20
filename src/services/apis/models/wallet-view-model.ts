import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class WalletViewModel {
    id!: string | undefined;
    name!: string | undefined;
    balance!: number;
    currencyCode!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, WalletViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): WalletViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<WalletViewModel>(data, WalletViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

