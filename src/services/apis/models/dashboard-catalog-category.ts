import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { DashboardCatalogItem } from './dashboard-catalog-item';

export class DashboardCatalogCategory {
    id!: string | undefined;
    name!: string | undefined;
    items!: DashboardCatalogItem[] | undefined;
    // Optional parent id for 2-level hierarchy (family > subfamily). Mirrors
    // CategoryViewModel.parentCategoryId. When set, this category is rendered
    // indented under its parent in the dashboard editor.
    parentCategoryId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardCatalogCategory, {
                items: { arrayOf: DashboardCatalogItem }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardCatalogCategory {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardCatalogCategory>(data, DashboardCatalogCategory, {
            items: { arrayOf: DashboardCatalogItem }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

