import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardReviewViewModel {
    id!: string | undefined;
    foodValue!: number;
    serviceValue!: number | undefined;
    placeValue!: number | undefined;
    rating!: number | undefined;
    review!: string | undefined;
    customerName!: string | undefined;
    createdAt!: Date;
    externalAuthor!: string | undefined;
    providerId!: number;
    photoUrls!: string[] | undefined;
    aiGeneratedResponse!: string | undefined;
    sentimentScore!: number | undefined;
    tags!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardReviewViewModel, {
                createdAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardReviewViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardReviewViewModel>(data, DashboardReviewViewModel, {
            createdAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

