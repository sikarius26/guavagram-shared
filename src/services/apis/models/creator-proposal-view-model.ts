import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CreatorPickCategoryEnum } from './creator-pick-category-enum';
import { CreatorProposalStatusEnum } from './creator-proposal-status-enum';

export class CreatorProposalViewModel {
    id!: string | undefined;
    fromStoreId!: string | undefined;
    fromStoreName!: string | undefined;
    storeLogoUrl!: string | undefined;
    offerCents!: number;
    pickCategory!: CreatorPickCategoryEnum;
    message!: string | undefined;
    status!: CreatorProposalStatusEnum;
    receivedAt!: Date;
    deadline!: Date | undefined;
    responseMessage!: string | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorProposalViewModel, {
                receivedAt: { date: true },
                deadline: { date: true },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorProposalViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorProposalViewModel>(data, CreatorProposalViewModel, {
            receivedAt: { date: true },
            deadline: { date: true },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}
