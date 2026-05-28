import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { AddressViewModel } from './address-view-model';
import { OrderTypeEnum } from './order-type-enum';
import { StoreOrderChannelViewModel } from './store-order-channel-view-model';
import { ExternalLinkTypeEnum } from './external-link-type-enum';
import { ExternalScriptTypeEnum } from './external-script-type-enum';
import { ScheduleViewModel } from './schedule-view-model';
import { BookingShiftViewModel } from './booking-shift-view-model';
import { BookingOfferViewModel } from './booking-offer-view-model';
import { StoreDeliveryAreaViewModel } from './store-delivery-area-view-model';

export class StoreInfoViewModel {
    id!: string | undefined;
    slugName!: string | undefined;
    name!: string | undefined;
    logoUrl!: string | undefined;
    currencyCode!: string | undefined;
    description!: string | undefined;
    address!: AddressViewModel | undefined;
    phoneNumber!: string | undefined;
    phoneDialCode!: string | undefined;
    emailAddress!: string | undefined;
    menuImageUrl!: string | undefined;
    welcomeMessage!: string | undefined;
    receiptMessage!: string | undefined;
    allowTableChange!: boolean;
    hasPaymentBeforeOrder!: boolean;
    displayServiceButton!: boolean;
    hideNotes!: boolean;
    hasBookings!: boolean;
    hasOrders!: boolean;
    isPro!: boolean;
    socialShareDiscountPercentage!: number | undefined;
    tipsEnabled!: boolean;
    hasPaylater!: boolean;
    isLiveMode!: boolean;
    orderChannelStatus!: { [key in keyof typeof OrderTypeEnum]?: StoreOrderChannelViewModel; } | undefined;
    countryCode!: string | undefined;
    enableCashOrders!: boolean;
    defaultLangCode!: string | undefined;
    externalLinks!: { [key in keyof typeof ExternalLinkTypeEnum]?: string; } | undefined;
    externalScripts!: { [key in keyof typeof ExternalScriptTypeEnum]?: string; } | undefined;
    weeklySchedule!: { [key: string]: ScheduleViewModel; } | undefined;
    bookingShifts!: BookingShiftViewModel[] | undefined;
    bookingOffers!: BookingOfferViewModel[] | undefined;
    deliveryAreas!: StoreDeliveryAreaViewModel[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, StoreInfoViewModel, {
                address: { model: AddressViewModel },
                orderChannelStatus: { dictionaryOf: StoreOrderChannelViewModel },
                weeklySchedule: { dictionaryOf: ScheduleViewModel },
                bookingShifts: { arrayOf: BookingShiftViewModel },
                bookingOffers: { arrayOf: BookingOfferViewModel },
                deliveryAreas: { arrayOf: StoreDeliveryAreaViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): StoreInfoViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<StoreInfoViewModel>(data, StoreInfoViewModel, {
            address: { model: AddressViewModel },
            orderChannelStatus: { dictionaryOf: StoreOrderChannelViewModel },
            weeklySchedule: { dictionaryOf: ScheduleViewModel },
            bookingShifts: { arrayOf: BookingShiftViewModel },
            bookingOffers: { arrayOf: BookingOfferViewModel },
            deliveryAreas: { arrayOf: StoreDeliveryAreaViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

