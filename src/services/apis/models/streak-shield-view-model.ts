import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class StreakShieldViewModel {
    isActive!: boolean;
    shieldsOwned!: number;
    costPoints!: number;
    expiresAt!: Date | undefined;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, StreakShieldViewModel, { expiresAt: { date: true } });
            Object.assign(this, mapped);
        }
    }

    static fromJS(data: any, _mappings?: any): StreakShieldViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StreakShieldViewModel>(data, StreakShieldViewModel, { expiresAt: { date: true } });
    }

    toJSON() { return dynamicToJSON(this); }
}
