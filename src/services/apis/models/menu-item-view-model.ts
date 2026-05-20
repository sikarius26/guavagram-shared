import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { InventoryProductMeasureUnitTypeEnum } from './inventory-product-measure-unit-type-enum';
import { CatalogLabelTypeEnum } from './catalog-label-type-enum';
import { MenuItemMediaViewModel } from './menu-item-media-view-model';

export class MenuItemViewModel {
    id!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;
    price!: number;
    inventoryProductMeasureUnitTypeId!: InventoryProductMeasureUnitTypeEnum;
    showOrderCourseSelection!: boolean;
    variantAttributeGroupId!: string | undefined;
    attributeGroupIds!: string[] | undefined;
    labels!: CatalogLabelTypeEnum[] | undefined;
    medias!: MenuItemMediaViewModel[] | undefined;
    recommendedMenuItems!: string[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuItemViewModel, {
                medias: { arrayOf: MenuItemMediaViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuItemViewModel>(data, MenuItemViewModel, {
            medias: { arrayOf: MenuItemMediaViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

