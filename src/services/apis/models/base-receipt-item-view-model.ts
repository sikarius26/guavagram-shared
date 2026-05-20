import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { TransactionStatusEnum } from './transaction-status-enum';
import { StoreViewModel } from './store-view-model';

export class BaseReceiptItemViewModel {
    sessionId!: string | undefined;
    transactionStatusId!: TransactionStatusEnum | undefined;
    receiptId!: string | undefined;
    currencyCode!: string | undefined;
    itemsCount!: number;
    total!: number;
    restaurant!: StoreViewModel | undefined;
    createdAt!: Date;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BaseReceiptItemViewModel, {
                restaurant: { model: StoreViewModel },
                createdAt: { date: true }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BaseReceiptItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BaseReceiptItemViewModel>(data, BaseReceiptItemViewModel, {
            restaurant: { model: StoreViewModel },
            createdAt: { date: true }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

