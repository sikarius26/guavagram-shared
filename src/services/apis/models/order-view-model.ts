import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { OrderListItemViewModel } from './order-list-item-view-model';
import { OrderItemViewModel } from './order-item-view-model';
import { AddressViewModel } from './address-view-model';
import { VoucherViewModel } from './voucher-view-model';
import { OrderBundleViewModel } from './order-bundle-view-model';

export class OrderViewModel extends OrderListItemViewModel {
    createdBySessionId!: string | undefined;
    items!: OrderItemViewModel[] | undefined;
    createdByNickname!: string | undefined;
    address!: AddressViewModel | undefined;
    phoneNumber!: string | undefined;
    deliveryFees!: number | undefined;
    estimatedDeliveryTimeMinutes!: number | undefined;
    phoneDialCode!: string | undefined;
    scheduledFor!: Date | undefined;
    isPending!: boolean;
    total!: number;
    vouchers!: VoucherViewModel[] | undefined;
    discountValue!: number | undefined;
    surchargeName!: string | undefined;
    surchargeValue!: number | undefined;
    isSurchargePercentage!: boolean;
    bundles!: OrderBundleViewModel[] | undefined;


    init(_data?: any, _mappings?: any) {
        super.init(_data);
        if (_data) {
            const mapped = dynamicFromJS(_data, OrderViewModel, {
                items: { arrayOf: OrderItemViewModel },
                address: { model: AddressViewModel },
                scheduledFor: { date: true },
                vouchers: { arrayOf: VoucherViewModel },
                bundles: { arrayOf: OrderBundleViewModel }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): OrderViewModel {
        data = typeof data === 'object' ? data : {};
        const parentInstance = OrderListItemViewModel.fromJS(data);
        const childInstance = dynamicFromJS<OrderViewModel>(data, OrderViewModel, {
            items: { arrayOf: OrderItemViewModel },
            address: { model: AddressViewModel },
            scheduledFor: { date: true },
            vouchers: { arrayOf: VoucherViewModel },
            bundles: { arrayOf: OrderBundleViewModel }
        });
        // Assign children
        Object.assign(childInstance, parentInstance);
        return childInstance;
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

