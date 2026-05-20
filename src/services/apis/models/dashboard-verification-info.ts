import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardVerificationInfo {
    isVerified!: boolean;
    daysUntilHidden!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardVerificationInfo, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardVerificationInfo {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardVerificationInfo>(data, DashboardVerificationInfo, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

