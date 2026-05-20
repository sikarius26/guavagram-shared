import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardPlanInfo {
    currentPlanName!: string | undefined;
    isPro!: boolean;
    upgradePlanId!: string | undefined;
    upgradePlanName!: string | undefined;
    upgradeMonthlyPrice!: number;
    currency!: string | undefined;
    upgradeTrialDays!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardPlanInfo, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardPlanInfo {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardPlanInfo>(data, DashboardPlanInfo, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

