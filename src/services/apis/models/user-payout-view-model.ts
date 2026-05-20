import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class UserPayoutViewModel {
    payoutId!: string | undefined;
    amount!: number;
    paidAt!: Date;
    status!: string | undefined;
    earningsCount!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserPayoutViewModel, {
                paidAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserPayoutViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserPayoutViewModel>(data, UserPayoutViewModel, {
            paidAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

