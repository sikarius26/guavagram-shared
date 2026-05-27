import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class DashboardStoreProfile {
    description!: string | undefined;
    accentColor!: string | undefined;
    logoUrl!: string | undefined;
    // coverUrl is added client-side ahead of the backend exposing it. When
    // the Guava platform API ships the field, the NSwag regen will keep this
    // shape and persistence flips on automatically. Until then the value
    // round-trips via the local /api/_mock/store/[slug]/bio-config endpoint.
    coverUrl!: string | undefined;
    slugName!: string | undefined;
    phoneNumber!: string | undefined;
    emailAddress!: string | undefined;
    welcomeMessage!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardStoreProfile, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardStoreProfile {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardStoreProfile>(data, DashboardStoreProfile, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

