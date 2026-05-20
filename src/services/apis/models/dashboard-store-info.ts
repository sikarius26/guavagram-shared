import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardStoreInfo {
    storeId!: string | undefined;
    displayName!: string | undefined;
    slugName!: string | undefined;
    logoUrl!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardStoreInfo, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardStoreInfo {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardStoreInfo>(data, DashboardStoreInfo, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

