import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardCurrentPlan {
    id!: string | undefined;
    name!: string | undefined;
    platformPlanId!: string | undefined;
    startAt!: Date | undefined;
    expireAt!: Date | undefined;
    renewAutomatically!: boolean;
    isAnnualRenewal!: boolean;
    price!: number;
    renewalPrice!: number;
    isActive!: boolean;
    daysTrial!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardCurrentPlan, {
                startAt: { date: true },
                expireAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardCurrentPlan {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardCurrentPlan>(data, DashboardCurrentPlan, {
            startAt: { date: true },
            expireAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

