import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CampaignRequest {
    creatorHandle!: string | undefined;
    pickId!: string | undefined;
    brief!: string | undefined;
    preferredStartDate!: Date | undefined;
    preferredEndDate!: Date | undefined;
    additionalBudgetEur!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CampaignRequest, {
                preferredStartDate: { date: true },
                preferredEndDate: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CampaignRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CampaignRequest>(data, CampaignRequest, {
            preferredStartDate: { date: true },
            preferredEndDate: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
