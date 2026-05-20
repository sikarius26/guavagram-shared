import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class InviteUserRequest {
    email!: string | undefined;
    message!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, InviteUserRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): InviteUserRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<InviteUserRequest>(data, InviteUserRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

