import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export type WishlistItemSource = 'guavagram' | 'google' | 'manual';

export class CreatorWishlistItemViewModel {
    id!: string | undefined;
    storeId!: string | undefined;
    googlePlaceId!: string | undefined;
    source!: WishlistItemSource | undefined;
    slugName!: string | undefined;
    name!: string | undefined;
    city!: string | undefined;
    address!: string | undefined;
    category!: string | undefined;
    rating!: number | undefined;
    imageUrl!: string | undefined;
    reason!: string | undefined;
    addedAt!: Date;
    priority!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorWishlistItemViewModel, {
                addedAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorWishlistItemViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorWishlistItemViewModel>(data, CreatorWishlistItemViewModel, {
            addedAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
