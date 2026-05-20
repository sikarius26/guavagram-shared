import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardKpiCard {
    value!: number;
    previousValue!: number;
    deltaPercent!: number | undefined;
    series!: number[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardKpiCard, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardKpiCard {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardKpiCard>(data, DashboardKpiCard, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

