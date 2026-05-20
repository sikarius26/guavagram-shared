import { GamificationProfileViewModel } from './models/gamification-profile-view-model';
import { GamificationActionViewModel } from './models/gamification-action-view-model';
import { GamificationRewardViewModel } from './models/gamification-reward-view-model';
import { GamificationLeaderboardEntryViewModel } from './models/gamification-leaderboard-entry-view-model';
import { GamificationRedeemRequest } from './models/gamification-redeem-request';
import { GamificationActionTypeEnum } from './models/gamification-action-type-enum';
import { ChallengeViewModel } from './models/challenge-view-model';
import { StreakShieldViewModel } from './models/streak-shield-view-model';
import { BadgeViewModel } from './models/badge-view-model';
import { ReviewVoteViewModel } from './models/review-vote-view-model';
import { StoreGamificationStatsViewModel } from './models/store-gamification-stats-view-model';
import { ReferralTierViewModel } from './models/referral-tier-view-model';
import { SponsoredChallengeRequest } from './models/sponsored-challenge-request';
//----------------------
// Gamification API Client
//----------------------

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios';

import type { FileResponse } from './api.client.shared';
import { throwException, isAxiosError, http } from './api.client.shared';
import { environment } from '../../environment';

export interface IGamificationApiClient {
    gamificationProfile(): Promise<GamificationProfileViewModel>;
    gamificationActions(skip: number, take: number): Promise<GamificationActionViewModel[]>;
    gamificationCheckIn(): Promise<GamificationActionViewModel>;
    gamificationTrackAction(actionType: GamificationActionTypeEnum, storeId?: string): Promise<GamificationActionViewModel>;
    gamificationRewards(): Promise<GamificationRewardViewModel[]>;
    gamificationRedeem(request: GamificationRedeemRequest): Promise<void>;
    gamificationLeaderboard(period: string): Promise<GamificationLeaderboardEntryViewModel[]>;
    gamificationChallenges(): Promise<ChallengeViewModel[]>;
    gamificationStreakShield(): Promise<StreakShieldViewModel>;
    gamificationBuyStreakShield(): Promise<StreakShieldViewModel>;
    gamificationBadges(): Promise<BadgeViewModel[]>;
    gamificationReviewVote(reviewId: string): Promise<ReviewVoteViewModel>;
    gamificationReviewVotes(reviewIds: string[]): Promise<ReviewVoteViewModel[]>;
}

class GamificationApiClient implements IGamificationApiClient {
    private instance: AxiosInstance;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(baseUrl?: string, instance?: AxiosInstance) {
        this.instance = instance ? instance : axios.create();
        this.baseUrl = baseUrl !== undefined && baseUrl !== null ? baseUrl : "";
    }

    gamificationProfile(cancelToken?: CancelToken | undefined): Promise<GamificationProfileViewModel> {
        let url_ = this.baseUrl + "/gamification/profile";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationProfile(_response);
        });
    }

    protected processGamificationProfile(response: AxiosResponse): Promise<GamificationProfileViewModel> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            result200 = GamificationProfileViewModel.fromJS(resultData200);
            return Promise.resolve<GamificationProfileViewModel>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationActions(skip: number, take: number, cancelToken?: CancelToken | undefined): Promise<GamificationActionViewModel[]> {
        let url_ = this.baseUrl + "/gamification/actions?skip=" + encodeURIComponent("" + skip) + "&take=" + encodeURIComponent("" + take);
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationActions(_response);
        });
    }

    protected processGamificationActions(response: AxiosResponse): Promise<GamificationActionViewModel[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            if (Array.isArray(resultData200)) {
                result200 = resultData200.map((i: any) => GamificationActionViewModel.fromJS(i));
            } else {
                result200 = [];
            }
            return Promise.resolve<GamificationActionViewModel[]>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationCheckIn(cancelToken?: CancelToken | undefined): Promise<GamificationActionViewModel> {
        let url_ = this.baseUrl + "/gamification/check-in";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "POST",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationCheckIn(_response);
        });
    }

    protected processGamificationCheckIn(response: AxiosResponse): Promise<GamificationActionViewModel> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            result200 = GamificationActionViewModel.fromJS(resultData200);
            return Promise.resolve<GamificationActionViewModel>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationTrackAction(actionType: GamificationActionTypeEnum, storeId?: string, cancelToken?: CancelToken | undefined): Promise<GamificationActionViewModel> {
        let url_ = this.baseUrl + "/gamification/track";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify({ actionType, storeId });

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "POST",
            url: url_,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationTrackAction(_response);
        });
    }

    protected processGamificationTrackAction(response: AxiosResponse): Promise<GamificationActionViewModel> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            result200 = GamificationActionViewModel.fromJS(resultData200);
            return Promise.resolve<GamificationActionViewModel>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationRewards(cancelToken?: CancelToken | undefined): Promise<GamificationRewardViewModel[]> {
        let url_ = this.baseUrl + "/gamification/rewards";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationRewards(_response);
        });
    }

    protected processGamificationRewards(response: AxiosResponse): Promise<GamificationRewardViewModel[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            if (Array.isArray(resultData200)) {
                result200 = resultData200.map((i: any) => GamificationRewardViewModel.fromJS(i));
            } else {
                result200 = [];
            }
            return Promise.resolve<GamificationRewardViewModel[]>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationRedeem(request: GamificationRedeemRequest, cancelToken?: CancelToken | undefined): Promise<void> {
        let url_ = this.baseUrl + "/gamification/redeem";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(request.toJSON());

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "POST",
            url: url_,
            headers: { "Content-Type": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationRedeem(_response);
        });
    }

    protected processGamificationRedeem(response: AxiosResponse): Promise<void> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200 || status === 204) {
            return Promise.resolve<void>(<any>null);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationLeaderboard(period: string, cancelToken?: CancelToken | undefined): Promise<GamificationLeaderboardEntryViewModel[]> {
        let url_ = this.baseUrl + "/gamification/leaderboard?period=" + encodeURIComponent("" + period);
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationLeaderboard(_response);
        });
    }

    protected processGamificationLeaderboard(response: AxiosResponse): Promise<GamificationLeaderboardEntryViewModel[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            if (Array.isArray(resultData200)) {
                result200 = resultData200.map((i: any) => GamificationLeaderboardEntryViewModel.fromJS(i));
            } else {
                result200 = [];
            }
            return Promise.resolve<GamificationLeaderboardEntryViewModel[]>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationChallenges(cancelToken?: CancelToken | undefined): Promise<ChallengeViewModel[]> {
        let url_ = this.baseUrl + "/gamification/challenges";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationChallenges(_response);
        });
    }

    protected processGamificationChallenges(response: AxiosResponse): Promise<ChallengeViewModel[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            if (Array.isArray(resultData200)) {
                result200 = resultData200.map((i: any) => ChallengeViewModel.fromJS(i));
            } else {
                result200 = [];
            }
            return Promise.resolve<ChallengeViewModel[]>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationStreakShield(cancelToken?: CancelToken | undefined): Promise<StreakShieldViewModel> {
        let url_ = this.baseUrl + "/gamification/streak-shield";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationStreakShield(_response);
        });
    }

    protected processGamificationStreakShield(response: AxiosResponse): Promise<StreakShieldViewModel> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            result200 = StreakShieldViewModel.fromJS(resultData200);
            return Promise.resolve<StreakShieldViewModel>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationBuyStreakShield(cancelToken?: CancelToken | undefined): Promise<StreakShieldViewModel> {
        let url_ = this.baseUrl + "/gamification/streak-shield/buy";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "POST",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationBuyStreakShield(_response);
        });
    }

    protected processGamificationBuyStreakShield(response: AxiosResponse): Promise<StreakShieldViewModel> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            result200 = StreakShieldViewModel.fromJS(resultData200);
            return Promise.resolve<StreakShieldViewModel>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationBadges(cancelToken?: CancelToken | undefined): Promise<BadgeViewModel[]> {
        let url_ = this.baseUrl + "/gamification/badges";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationBadges(_response);
        });
    }

    protected processGamificationBadges(response: AxiosResponse): Promise<BadgeViewModel[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            if (Array.isArray(resultData200)) {
                result200 = resultData200.map((i: any) => BadgeViewModel.fromJS(i));
            } else {
                result200 = [];
            }
            return Promise.resolve<BadgeViewModel[]>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationReviewVote(reviewId: string, cancelToken?: CancelToken | undefined): Promise<ReviewVoteViewModel> {
        let url_ = this.baseUrl + "/gamification/review-vote";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify({ reviewId });

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "POST",
            url: url_,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationReviewVote(_response);
        });
    }

    protected processGamificationReviewVote(response: AxiosResponse): Promise<ReviewVoteViewModel> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            result200 = ReviewVoteViewModel.fromJS(resultData200);
            return Promise.resolve<ReviewVoteViewModel>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationReviewVotes(reviewIds: string[], cancelToken?: CancelToken | undefined): Promise<ReviewVoteViewModel[]> {
        let url_ = this.baseUrl + "/gamification/review-votes";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify({ reviewIds });

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "POST",
            url: url_,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationReviewVotes(_response);
        });
    }

    protected processGamificationReviewVotes(response: AxiosResponse): Promise<ReviewVoteViewModel[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            if (Array.isArray(resultData200)) {
                result200 = resultData200.map((i: any) => ReviewVoteViewModel.fromJS(i));
            } else {
                result200 = [];
            }
            return Promise.resolve<ReviewVoteViewModel[]>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationStoreStats(storeId: string, cancelToken?: CancelToken | undefined): Promise<StoreGamificationStatsViewModel> {
        let url_ = this.baseUrl + "/gamification/store/" + encodeURIComponent("" + storeId) + "/stats";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationStoreStats(_response);
        });
    }

    protected processGamificationStoreStats(response: AxiosResponse): Promise<StoreGamificationStatsViewModel> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            result200 = StoreGamificationStatsViewModel.fromJS(resultData200);
            return Promise.resolve<StoreGamificationStatsViewModel>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationReferralNetwork(skip: number, take: number, cancelToken?: CancelToken | undefined): Promise<ReferralTierViewModel[]> {
        let url_ = this.baseUrl + "/gamification/referral-network?skip=" + encodeURIComponent("" + skip) + "&take=" + encodeURIComponent("" + take);
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: { "Accept": "application/json" },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationReferralNetwork(_response);
        });
    }

    protected processGamificationReferralNetwork(response: AxiosResponse): Promise<ReferralTierViewModel[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200 = _responseText;
            if (Array.isArray(resultData200)) {
                result200 = resultData200.map((i: any) => ReferralTierViewModel.fromJS(i));
            } else {
                result200 = [];
            }
            return Promise.resolve<ReferralTierViewModel[]>(result200);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }

    gamificationSponsorChallenge(storeId: string, request: SponsoredChallengeRequest, cancelToken?: CancelToken | undefined): Promise<void> {
        let url_ = this.baseUrl + "/gamification/store/" + encodeURIComponent("" + storeId) + "/sponsor-challenge";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(request.toJSON());

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "POST",
            url: url_,
            headers: {
                "Content-Type": "application/json",
            },
            cancelToken
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGamificationSponsorChallenge(_response);
        });
    }

    protected processGamificationSponsorChallenge(response: AxiosResponse): Promise<void> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (let k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200 || status === 204) {
            return Promise.resolve<void>(<any>null);
        } else {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
    }
}

export const gamificationApiClient = new GamificationApiClient(environment.baseUrl, http);
