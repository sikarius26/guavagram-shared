import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class PositionViewModel {
    lat!: number;
    lng!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, PositionViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): PositionViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<PositionViewModel>(data, PositionViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
