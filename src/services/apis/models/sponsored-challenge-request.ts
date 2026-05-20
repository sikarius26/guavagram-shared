import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class SponsoredChallengeRequest {
    title!: string;
    description!: string | undefined;
    targetActionType!: number;
    targetCount!: number;
    bonusPoints!: number;
    durationDays!: number;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, SponsoredChallengeRequest, {});
            Object.assign(this, mapped);
        }
    }

    static fromJS(data: any, _mappings?: any): SponsoredChallengeRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<SponsoredChallengeRequest>(data, SponsoredChallengeRequest, {});
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
