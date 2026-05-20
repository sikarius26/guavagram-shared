import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class OnboardingMenuImportResult {
    status!: string | undefined;
    operationId!: string | undefined;
    itemCount!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, OnboardingMenuImportResult, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OnboardingMenuImportResult {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<OnboardingMenuImportResult>(data, OnboardingMenuImportResult, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

