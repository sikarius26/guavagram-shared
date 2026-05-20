import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { PaymentProviderEnum } from './payment-provider-enum';

export class PaymentMethodViewModel {
    id!: string | undefined;
    name!: string | undefined;
    last4!: string | undefined;
    bin!: string | undefined;
    expiryYear!: number | undefined;
    expiryMonth!: number | undefined;
    scheme!: string | undefined;
    productType!: string | undefined;
    serviceFeePercentage!: number;
    serviceFeeAmount!: number;
    paymentProviderId!: PaymentProviderEnum;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PaymentMethodViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PaymentMethodViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PaymentMethodViewModel>(data, PaymentMethodViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

