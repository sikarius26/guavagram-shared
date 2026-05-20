import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class BillingStatusResponse {
    platformPlanId!: string | undefined;
    planName!: string | undefined;
    isActive!: boolean;
    isAnnual!: boolean;
    currentPeriodEndsAt!: Date | undefined;
    renewAutomatically!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BillingStatusResponse, {
                currentPeriodEndsAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BillingStatusResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BillingStatusResponse>(data, BillingStatusResponse, {
            currentPeriodEndsAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

