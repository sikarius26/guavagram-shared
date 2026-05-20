import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { PaymentProviderEnum } from './payment-provider-enum';
import { PaymentInfoViewModel } from './payment-info-view-model';

export class CheckoutRequest {
    paymentProviderId!: PaymentProviderEnum;
    paymentInfo!: PaymentInfoViewModel | undefined;
    hasPackagingAndService!: boolean;
    email!: string | undefined;
    amount!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CheckoutRequest, {
                paymentInfo: { model: PaymentInfoViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CheckoutRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CheckoutRequest>(data, CheckoutRequest, {
            paymentInfo: { model: PaymentInfoViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

