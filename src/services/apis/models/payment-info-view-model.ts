import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { SecretTypeEnum } from './secret-type-enum';

export class PaymentInfoViewModel {
    paymentMethodId!: string | undefined;
    secretType!: SecretTypeEnum;
    clientSecret!: string | undefined;
    saveData!: boolean;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PaymentInfoViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PaymentInfoViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PaymentInfoViewModel>(data, PaymentInfoViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

