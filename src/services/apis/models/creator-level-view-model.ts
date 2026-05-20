import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CreatorLevelEnum } from './creator-level-enum';

export class CreatorLevelViewModel {
    level!: CreatorLevelEnum;
    label!: string | undefined;
    completedCampaigns!: number;
    avgRating!: number;
    nextLevelProgress!: number | undefined;
    nextLevelName!: string | undefined;
    benefits!: { icon: string; label: string }[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorLevelViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorLevelViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorLevelViewModel>(data, CreatorLevelViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
