import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { LoginProviderTypeEnum } from './login-provider-type-enum';

export class UserLoginRequest {
    email!: string | undefined;
    phoneDialCode!: string | undefined;
    phoneNumber!: string | undefined;
    tokenOrPassword!: string | undefined;
    isPasswordless!: boolean;
    loginProviderTypeId!: LoginProviderTypeEnum;
    name!: string | undefined;
    languageCode!: string | undefined;
    businessName!: string | undefined;
    referral!: string | undefined;
    extraRegistrationInfos!: { [key: string]: string; } | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, UserLoginRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): UserLoginRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<UserLoginRequest>(data, UserLoginRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

