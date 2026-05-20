import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class ReportStoreRequest {
    reportedStoreId!: string | undefined;
    receiptImage!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, ReportStoreRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): ReportStoreRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<ReportStoreRequest>(data, ReportStoreRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

