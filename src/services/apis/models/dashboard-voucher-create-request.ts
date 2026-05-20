import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardVoucherCreateRequest {
    templateId!: string | undefined;
    value!: number;
    issuerNotes!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardVoucherCreateRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardVoucherCreateRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardVoucherCreateRequest>(data, DashboardVoucherCreateRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

