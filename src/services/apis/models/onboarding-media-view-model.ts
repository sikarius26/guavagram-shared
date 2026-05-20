import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingMediaViewModel {
    id!: string | undefined;
    name!: string | undefined;
    caption!: string | undefined;
    mediaUrl!: string | undefined;
    isVideo!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingMediaViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingMediaViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingMediaViewModel>(data, OnboardingMediaViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

