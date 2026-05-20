import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { SessionViewModel } from './session-view-model';

export class CreateSessionResponse {
    session!: SessionViewModel | undefined;
    tableId!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreateSessionResponse, {
                session: { model: SessionViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreateSessionResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreateSessionResponse>(data, CreateSessionResponse, {
            session: { model: SessionViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

