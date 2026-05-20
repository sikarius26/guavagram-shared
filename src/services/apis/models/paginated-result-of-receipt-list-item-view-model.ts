import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { ReceiptListItemViewModel } from './receipt-list-item-view-model';

export class PaginatedResultOfReceiptListItemViewModel {
    items!: ReceiptListItemViewModel[];
    totalRecords!: number;
    pageSize!: number;
    currentPageIdx!: number;
    totalPages!: number;
    orderBy!: string | undefined;
    orderByAscending!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PaginatedResultOfReceiptListItemViewModel, {
                items: { arrayOf: ReceiptListItemViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PaginatedResultOfReceiptListItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PaginatedResultOfReceiptListItemViewModel>(data, PaginatedResultOfReceiptListItemViewModel, {
            items: { arrayOf: ReceiptListItemViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

