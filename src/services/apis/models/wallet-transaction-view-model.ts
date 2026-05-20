import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class WalletTransactionViewModel {


    init(_data?: any, _mappings?: any) {
    }

    static fromJS(
        data: any, _mappings?: any
    ): WalletTransactionViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<WalletTransactionViewModel>(data, WalletTransactionViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

