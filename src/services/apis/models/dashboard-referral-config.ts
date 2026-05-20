import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardReferralConfig {
    referralBonus!: number;
    isActive!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardReferralConfig, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardReferralConfig {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardReferralConfig>(data, DashboardReferralConfig, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

