import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { TemporaryTokenTypeEnum } from './temporary-token-type-enum';

export class VerifyTokenRequest {
    token!: string | undefined;
    tokenTypeId!: TemporaryTokenTypeEnum;
    source!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, VerifyTokenRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): VerifyTokenRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<VerifyTokenRequest>(data, VerifyTokenRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

