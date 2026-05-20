import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { DashboardCatalogCategory } from './dashboard-catalog-category';

export class DashboardCatalogViewModel {
    catalogId!: string | undefined;
    categories!: DashboardCatalogCategory[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardCatalogViewModel, {
                categories: { arrayOf: DashboardCatalogCategory }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardCatalogViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardCatalogViewModel>(data, DashboardCatalogViewModel, {
            categories: { arrayOf: DashboardCatalogCategory }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

