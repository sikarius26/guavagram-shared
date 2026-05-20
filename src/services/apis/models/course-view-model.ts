import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export class CourseViewModel {
    id!: string | undefined;
    position!: number;
    name!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CourseViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CourseViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CourseViewModel>(data, CourseViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

