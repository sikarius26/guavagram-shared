import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class BadgeViewModel {
    id!: string;
    name!: string;
    description!: string | undefined;
    iconName!: string;
    category!: string;
    earnedAt!: Date | undefined;
    isEarned!: boolean;
    requirement!: string | undefined;

    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BadgeViewModel, {
                earnedAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BadgeViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BadgeViewModel>(data, BadgeViewModel, {
            earnedAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
