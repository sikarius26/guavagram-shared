import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { StoreCategoryTagEnum } from './store-category-tag-enum';

export class ReportCatalogRequest {
    googleMapsId!: string | undefined;
    name!: string | undefined;
    latitude!: number;
    longitude!: number;
    menuImage!: string | undefined;
    tags!: StoreCategoryTagEnum[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, ReportCatalogRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): ReportCatalogRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<ReportCatalogRequest>(data, ReportCatalogRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

