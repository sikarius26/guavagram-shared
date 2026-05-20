import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CatalogLabelTypeEnum } from './catalog-label-type-enum';

export class MenuAttributeItemViewModel {
    id!: string | undefined;
    price!: number;
    name!: string | undefined;
    maxSelections!: number;
    defaultSelected!: boolean;
    labels!: CatalogLabelTypeEnum[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuAttributeItemViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuAttributeItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuAttributeItemViewModel>(data, MenuAttributeItemViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

