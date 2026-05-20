import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { StoreSearchResultItemViewModel } from './store-search-result-item-view-model';

export class PaginatedResultOfStoreSearchResultItemViewModel {
    items!: StoreSearchResultItemViewModel[];
    totalRecords!: number;
    pageSize!: number;
    currentPageIdx!: number;
    totalPages!: number;
    orderBy!: string | undefined;
    orderByAscending!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PaginatedResultOfStoreSearchResultItemViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PaginatedResultOfStoreSearchResultItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PaginatedResultOfStoreSearchResultItemViewModel>(data, PaginatedResultOfStoreSearchResultItemViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

