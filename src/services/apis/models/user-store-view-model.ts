import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class UserStoreViewModel {
    userProfileStoreId!: string | undefined;
    storeId!: string | undefined;
    slugName!: string | undefined;
    name!: string | undefined;
    logoUrl!: string | undefined;
    weight!: number;
    personalPick!: boolean;
    personalNotes!: string | undefined;
    publishedAt!: Date | undefined;
    expireAt!: Date | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserStoreViewModel, {
                publishedAt: { date: true },
                expireAt: { date: true }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserStoreViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserStoreViewModel>(data, UserStoreViewModel, {
            publishedAt: { date: true },
            expireAt: { date: true }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

