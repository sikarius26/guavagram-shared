import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class SessionViewModel {
    id!: string | undefined;
    userId!: string | undefined;
    nickName!: string | undefined;
    languageCode!: string | undefined;
    currencyCode!: string | undefined;
    tableNumber!: string | undefined;
    restaurantSlug!: string | undefined;
    token!: string | undefined;
    expireAt!: Date;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, SessionViewModel, {
                expireAt: { date: true }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): SessionViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<SessionViewModel>(data, SessionViewModel, {
            expireAt: { date: true }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

