import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class ReviewViewModel {
    foodValue!: number;
    placeValue!: number | undefined;
    serviceValue!: number | undefined;
    review!: string | undefined;
    bookingId!: string | undefined;
    rating!: number | undefined;
    email!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, ReviewViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): ReviewViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<ReviewViewModel>(data, ReviewViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

