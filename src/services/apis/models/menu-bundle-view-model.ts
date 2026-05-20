import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { MenuBundleCategoryViewModel } from './menu-bundle-category-view-model';

export class MenuBundleViewModel {
    id!: string | undefined;
    price!: number;
    name!: string | undefined;
    imageUrl!: string | undefined;
    description!: string | undefined;
    bundleCategories!: MenuBundleCategoryViewModel[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuBundleViewModel, {
                bundleCategories: { arrayOf: MenuBundleCategoryViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuBundleViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuBundleViewModel>(data, MenuBundleViewModel, {
            bundleCategories: { arrayOf: MenuBundleCategoryViewModel }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

