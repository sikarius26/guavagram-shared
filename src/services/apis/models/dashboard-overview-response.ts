import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { DashboardVerificationInfo } from './dashboard-verification-info';
import { DashboardKpiCard } from './dashboard-kpi-card';
import { DashboardPlanInfo } from './dashboard-plan-info';

export class DashboardOverviewResponse {
    verification!: DashboardVerificationInfo | undefined;
    profileViews!: DashboardKpiCard | undefined;
    ctaClicks!: DashboardKpiCard | undefined;
    fidelityCards!: DashboardKpiCard | undefined;
    avgRating!: DashboardKpiCard | undefined;
    loyaltyMembers!: number;
    plan!: DashboardPlanInfo | undefined;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, DashboardOverviewResponse, {
                verification: { model: DashboardVerificationInfo },
                profileViews: { model: DashboardKpiCard },
                ctaClicks: { model: DashboardKpiCard },
                fidelityCards: { model: DashboardKpiCard },
                avgRating: { model: DashboardKpiCard },
                plan: { model: DashboardPlanInfo }
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): DashboardOverviewResponse {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<DashboardOverviewResponse>(data, DashboardOverviewResponse, {
            verification: { model: DashboardVerificationInfo },
            profileViews: { model: DashboardKpiCard },
            ctaClicks: { model: DashboardKpiCard },
            fidelityCards: { model: DashboardKpiCard },
            avgRating: { model: DashboardKpiCard },
            plan: { model: DashboardPlanInfo }
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

