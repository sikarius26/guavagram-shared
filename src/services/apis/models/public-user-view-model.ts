import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class PublicUserViewModel {
    userId!: string | undefined;
    name!: string | undefined;
    username!: string | undefined;
    profileImageUrl!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PublicUserViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PublicUserViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PublicUserViewModel>(data, PublicUserViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

