import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { AddressViewModel } from './address-view-model';
import { GenderTypeEnum } from './gender-type-enum';

export class UserViewModel {
    name!: string | undefined;
    surname!: string | undefined;
    picture!: string | undefined;
    email!: string | undefined;
    username!: string | undefined;
    phoneDialCode!: string | undefined;
    phoneNumber!: string | undefined;
    address!: AddressViewModel | undefined;
    gender!: GenderTypeEnum;
    age!: number | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserViewModel, {
                address: { model: AddressViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserViewModel>(data, UserViewModel, {
            address: { model: AddressViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

