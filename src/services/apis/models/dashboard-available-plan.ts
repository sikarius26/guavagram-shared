import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardAvailablePlan {
    id!: string | undefined;
    name!: string | undefined;
    description!: string | undefined;
    monthlyPricing!: number;
    annualPricing!: number;
    daysTrial!: number;
    isRecommended!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardAvailablePlan, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardAvailablePlan {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardAvailablePlan>(data, DashboardAvailablePlan, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

