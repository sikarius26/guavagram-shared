import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { PaymentMethodViewModel } from './payment-method-view-model';

export class SessionPaymentMethodViewModel extends PaymentMethodViewModel {
    imageUrl!: string | undefined;
    minAmount!: number | undefined;
    balance!: number | undefined;
    currencyCode!: string | undefined;


    init(_data?: any, _mappings?: any) {
        super.init(_data);
        if (_data) {
            const mapped = dynamicFromJS(_data, SessionPaymentMethodViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): SessionPaymentMethodViewModel {
        data = typeof data === 'object' ? data : {};
        const parentInstance = PaymentMethodViewModel.fromJS(data);
        const childInstance = dynamicFromJS<SessionPaymentMethodViewModel>(data, SessionPaymentMethodViewModel, {
        });
        // Assign children
        Object.assign(childInstance, parentInstance);
        return childInstance;
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

