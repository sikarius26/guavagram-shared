import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class SendCreatorOfferRequest {
    leadId!: string | undefined;
    code!: string | undefined;
    percentOff!: number | undefined;
    flatOffCents!: number | undefined;
    expireAt!: Date;
    message!: string | undefined;
    maxUses!: number | undefined;

    init(_data?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, SendCreatorOfferRequest, {
                expireAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(data: any): SendCreatorOfferRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<SendCreatorOfferRequest>(data, SendCreatorOfferRequest, {
            expireAt: { date: true },
        });
    }

    toJSON() { return dynamicToJSON(this); }
}
