import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardCatalogItem {
    id!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;
    price!: number;
    photoUrl!: string | undefined;
    labels!: number[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardCatalogItem, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardCatalogItem {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardCatalogItem>(data, DashboardCatalogItem, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

