import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CategoryViewModel {
    id!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;
    imageUrl!: string | undefined;
    showOrderCourseSelection!: boolean;
    menuItemIds!: string[] | undefined;
    // Optional parent id for 2-level hierarchy (family > subfamily). When undefined/null
    // the category is top-level; when set, it points to another CategoryViewModel.id.
    parentCategoryId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CategoryViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CategoryViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CategoryViewModel>(data, CategoryViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

