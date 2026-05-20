import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CreatorRecommendedStoreViewModel {
    userProfileStoreId!: string | undefined;
    storeId!: string | undefined;
    slugName!: string | undefined;
    name!: string | undefined;
    logoUrl!: string | undefined;
    weight!: number;
    personalPick!: boolean;
    personalNotes!: string | undefined;
    coverUrl!: string | undefined;
    category!: string | undefined;
    badges!: string[] | undefined;
    discountCode!: string | undefined;
    discountPercent!: number | undefined;
    discountLabel!: string | undefined;
    personalQuote!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorRecommendedStoreViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorRecommendedStoreViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorRecommendedStoreViewModel>(data, CreatorRecommendedStoreViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
