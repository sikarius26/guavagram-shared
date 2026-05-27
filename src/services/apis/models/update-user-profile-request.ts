import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class UpdateUserProfileRequest {
    handle!: string | undefined;
    bio!: string | undefined;
    city!: string | undefined;
    profileImageUrl!: string | undefined;
    coverImageUrl!: string | undefined;
    // Free-form JSON bag (style, visibility, etc.). Mirrors the pattern used
    // by StoreProfileViewModel.brandingSettings for restaurants.
    brandingSettings!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UpdateUserProfileRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UpdateUserProfileRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UpdateUserProfileRequest>(data, UpdateUserProfileRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

