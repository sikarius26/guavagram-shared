import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class PostContentRequest {
    content!: string | undefined;
    images!: string[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PostContentRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PostContentRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PostContentRequest>(data, PostContentRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

