import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CreatorFeaturedStoreViewModel {
    userProfileStoreId!: string | undefined;
    storeId!: string | undefined;
    slugName!: string | undefined;
    name!: string | undefined;
    logoUrl!: string | undefined;
    coverUrl!: string | undefined;
    headline!: string | undefined;
    personalNotes!: string | undefined;
    discountCode!: string | undefined;
    discountPercent!: number | undefined;
    discountLabel!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorFeaturedStoreViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorFeaturedStoreViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorFeaturedStoreViewModel>(data, CreatorFeaturedStoreViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
