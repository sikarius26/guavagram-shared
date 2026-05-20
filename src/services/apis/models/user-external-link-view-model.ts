import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class UserExternalLinkViewModel {
    externalLinkTypeId!: number;
    value!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserExternalLinkViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserExternalLinkViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserExternalLinkViewModel>(data, UserExternalLinkViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

