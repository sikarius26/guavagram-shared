import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class UserEarningViewModel {
    userEarningId!: string | undefined;
    orderId!: string | undefined;
    bookingId!: string | undefined;
    amount!: number;
    status!: number;
    payoutId!: string | undefined;
    paidAt!: Date | undefined;
    createdAt!: Date;
    storeName!: string | undefined;
    orderTotal!: number | undefined;
    bookingTotal!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserEarningViewModel, {
                paidAt: { date: true },
                createdAt: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserEarningViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserEarningViewModel>(data, UserEarningViewModel, {
            paidAt: { date: true },
            createdAt: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

