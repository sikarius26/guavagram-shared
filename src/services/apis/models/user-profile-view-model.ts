import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { UserProfileStatsViewModel } from './user-profile-stats-view-model';
import { UserExternalLinkViewModel } from './user-external-link-view-model';

export class UserProfileViewModel {
    handle!: string | undefined;
    name!: string | undefined;
    bio!: string | undefined;
    city!: string | undefined;
    profileImageUrl!: string | undefined;
    coverImageUrl!: string | undefined;
    // Free-form JSON bag (style, visibility, etc.). Same pattern as
    // StoreProfileViewModel.brandingSettings.
    brandingSettings!: string | undefined;
    verified!: boolean;
    stats!: UserProfileStatsViewModel | undefined;
    externalLinks!: UserExternalLinkViewModel[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserProfileViewModel, {
                stats: { model: UserProfileStatsViewModel },
                externalLinks: { arrayOf: UserExternalLinkViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserProfileViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserProfileViewModel>(data, UserProfileViewModel, {
            stats: { model: UserProfileStatsViewModel },
            externalLinks: { arrayOf: UserExternalLinkViewModel }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

