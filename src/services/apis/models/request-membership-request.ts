import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { ExternalLinkItemRequest } from './external-link-item-request';

export class RequestMembershipRequest {
    acceptAgreement!: boolean;
    bio!: string | undefined;
    city!: string | undefined;
    handlePreference!: string | undefined;
    externalLinks!: ExternalLinkItemRequest[] | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, RequestMembershipRequest, {
                externalLinks: { arrayOf: ExternalLinkItemRequest }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): RequestMembershipRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<RequestMembershipRequest>(data, RequestMembershipRequest, {
            externalLinks: { arrayOf: ExternalLinkItemRequest }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

