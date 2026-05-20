import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class AddFriendRequest {
    message!: string | undefined;
    userId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, AddFriendRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): AddFriendRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<AddFriendRequest>(data, AddFriendRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

