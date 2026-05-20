import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class UtmParametersViewModel {
    utmSource!: string | undefined;
    utmMedium!: string | undefined;
    utmCampaign!: string | undefined;
    utmTerm!: string | undefined;
    utmContent!: string | undefined;
    fbp!: string | undefined;
    fbc!: string | undefined;
    referrer!: string | undefined;
    userAgent!: string | undefined;
    timestamp!: Date;
    phone!: string | undefined;
    email!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UtmParametersViewModel, {
                timestamp: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UtmParametersViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UtmParametersViewModel>(data, UtmParametersViewModel, {
            timestamp: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

