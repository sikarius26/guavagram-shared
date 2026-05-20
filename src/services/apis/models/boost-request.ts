import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class BoostRequest {
    creatorHandle!: string | undefined;
    pickId!: string | undefined;
    boostType!: 'pick-7d' | 'top-1d';


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, BoostRequest, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): BoostRequest {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<BoostRequest>(data, BoostRequest, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
