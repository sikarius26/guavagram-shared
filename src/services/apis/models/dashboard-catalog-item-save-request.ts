import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardCatalogItemSaveRequest {
    itemId!: string | undefined;
    categoryId!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;
    price!: number;
    photoUrl!: string | undefined;
    labels!: number[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardCatalogItemSaveRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardCatalogItemSaveRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardCatalogItemSaveRequest>(data, DashboardCatalogItemSaveRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

