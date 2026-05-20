import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CountryEnum } from './country-enum';

export class AddressViewModel {
    id!: string | undefined;
    addressLine1!: string | undefined;
    addressLine2!: string | undefined;
    city!: string | undefined;
    state!: string | undefined;
    postalCode!: string | undefined;
    lat!: number | undefined;
    lon!: number | undefined;
    googlePlaceId!: string | undefined;
    countryId!: CountryEnum;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, AddressViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): AddressViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<AddressViewModel>(data, AddressViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

