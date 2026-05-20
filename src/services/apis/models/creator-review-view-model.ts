import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CreatorReviewViewModel {
    id!: string | undefined;
    mediaUrl!: string | undefined;
    mediaType!: 'image' | 'video';
    caption!: string | undefined;
    storeId!: string | undefined;
    storeName!: string | undefined;
    rating!: number | undefined;
    publishedAt!: Date;
    views!: number;
    likes!: number;
    orderIdx!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorReviewViewModel, {
                publishedAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorReviewViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorReviewViewModel>(data, CreatorReviewViewModel, {
            publishedAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
