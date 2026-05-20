import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { NotificationTypeEnum } from './notification-type-enum';
import { NotificationMediumTypeEnum } from './notification-medium-type-enum';

export class NotificationViewModel {
    id!: string | undefined;
    notificationTypeId!: NotificationTypeEnum;
    notificationMediumTypeId!: NotificationMediumTypeEnum;
    jsonData!: string | undefined;
    sessionId!: string | undefined;
    userId!: string | undefined;
    readAt!: Date | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, NotificationViewModel, {
                readAt: { date: true }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): NotificationViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<NotificationViewModel>(data, NotificationViewModel, {
            readAt: { date: true }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

