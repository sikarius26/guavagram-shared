import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class MenuAttributeGroupViewModel {
    id!: string | undefined;
    name!: string | undefined;
    defaultVariantAttributeId!: string | undefined;
    attributeIds!: string[] | undefined;
    maxSelections!: number | undefined;
    minSelections!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuAttributeGroupViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuAttributeGroupViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuAttributeGroupViewModel>(data, MenuAttributeGroupViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

