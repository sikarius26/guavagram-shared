import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CreatorBadgeTypeEnum } from './creator-badge-type-enum';

export class CreatorBadgeViewModel {
    type!: CreatorBadgeTypeEnum;
    label!: string | undefined;
    iconMdi!: string | undefined;
    colorHex!: string | undefined;
    earnedAt!: Date | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorBadgeViewModel, {
                earnedAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorBadgeViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorBadgeViewModel>(data, CreatorBadgeViewModel, {
            earnedAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
