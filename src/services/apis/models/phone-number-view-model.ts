import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class PhoneNumberViewModel {
    phoneDialCode!: string | undefined;
    nationalNumber!: string | undefined;
    fullPhoneNumber!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PhoneNumberViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PhoneNumberViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PhoneNumberViewModel>(data, PhoneNumberViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

