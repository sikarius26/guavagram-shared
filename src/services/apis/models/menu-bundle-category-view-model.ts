import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class MenuBundleCategoryViewModel {
    id!: string | undefined;
    itemsCount!: number | undefined;
    name!: string | undefined;
    description!: string | undefined;
    menuItems!: { [key: string]: number; } | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuBundleCategoryViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuBundleCategoryViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuBundleCategoryViewModel>(data, MenuBundleCategoryViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

