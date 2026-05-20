import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class ReviewVoteViewModel {
    reviewId!: string;
    helpfulCount!: number;
    hasVoted!: boolean;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, ReviewVoteViewModel, {});
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): ReviewVoteViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<ReviewVoteViewModel>(data, ReviewVoteViewModel, {});
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
