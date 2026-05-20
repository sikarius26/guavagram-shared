import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CourseViewModel } from './course-view-model';
import { CategoryViewModel } from './category-view-model';
import { MenuItemViewModel } from './menu-item-view-model';
import { MenuBundleViewModel } from './menu-bundle-view-model';
import { StoreViewModel } from './store-view-model';
import { MenuAttributeGroupViewModel } from './menu-attribute-group-view-model';
import { MenuAttributeItemViewModel } from './menu-attribute-item-view-model';

export class MenuViewModel {
    languageCode!: string | undefined;
    id!: string | undefined;
    imageUrl!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;
    isFixedPrice!: boolean;
    price!: number | undefined;
    orderCourses!: CourseViewModel[] | undefined;
    availableLanguages!: string[] | undefined;
    categories!: CategoryViewModel[] | undefined;
    items!: MenuItemViewModel[] | undefined;
    bundles!: MenuBundleViewModel[] | undefined;
    store!: StoreViewModel | undefined;
    attributeGroups!: MenuAttributeGroupViewModel[] | undefined;
    attributes!: MenuAttributeItemViewModel[] | undefined;
    suggestedItems!: string[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuViewModel, {
                orderCourses: { arrayOf: CourseViewModel },
                categories: { arrayOf: CategoryViewModel },
                items: { arrayOf: MenuItemViewModel },
                bundles: { arrayOf: MenuBundleViewModel },
                store: { model: StoreViewModel },
                attributeGroups: { arrayOf: MenuAttributeGroupViewModel },
                attributes: { arrayOf: MenuAttributeItemViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuViewModel>(data, MenuViewModel, {
            orderCourses: { arrayOf: CourseViewModel },
            categories: { arrayOf: CategoryViewModel },
            items: { arrayOf: MenuItemViewModel },
            bundles: { arrayOf: MenuBundleViewModel },
            store: { model: StoreViewModel },
            attributeGroups: { arrayOf: MenuAttributeGroupViewModel },
            attributes: { arrayOf: MenuAttributeItemViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

