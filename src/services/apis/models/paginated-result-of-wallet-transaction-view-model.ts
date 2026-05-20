import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { WalletTransactionViewModel } from './wallet-transaction-view-model';

export class PaginatedResultOfWalletTransactionViewModel {
    items!: WalletTransactionViewModel[];
    totalRecords!: number;
    pageSize!: number;
    currentPageIdx!: number;
    totalPages!: number;
    orderBy!: string | undefined;
    orderByAscending!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PaginatedResultOfWalletTransactionViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PaginatedResultOfWalletTransactionViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PaginatedResultOfWalletTransactionViewModel>(data, PaginatedResultOfWalletTransactionViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

