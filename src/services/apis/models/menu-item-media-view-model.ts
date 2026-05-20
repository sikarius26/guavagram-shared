import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class MenuItemMediaViewModel {
    id!: string | undefined;
    mediaUrl!: string | undefined;
    isVideo!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, MenuItemMediaViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): MenuItemMediaViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<MenuItemMediaViewModel>(data, MenuItemMediaViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

