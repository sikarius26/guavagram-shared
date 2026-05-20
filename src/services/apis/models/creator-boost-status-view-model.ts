import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CreatorBoostStatusViewModel {
    active!: boolean;
    tier!: 'basic' | 'pro' | 'elite' | undefined;
    startedAt!: Date | undefined;
    expireAt!: Date | undefined;
    priceCents!: number;
    impressionsLastWeek!: number;
    rankImprovement!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorBoostStatusViewModel, {
                startedAt: { date: true },
                expireAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorBoostStatusViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorBoostStatusViewModel>(data, CreatorBoostStatusViewModel, {
            startedAt: { date: true },
            expireAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
