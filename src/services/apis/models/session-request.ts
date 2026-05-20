import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class SessionRequest {
    restaurantSlug!: string | undefined;
    tableId!: string | undefined;
    fingerPrintId!: string | undefined;
    languageCode!: string | undefined;
    deviceInfo!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, SessionRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): SessionRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<SessionRequest>(data, SessionRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

