import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';
import { CreatorPickCategoryEnum } from './creator-pick-category-enum';
import { CreatorPickPackageViewModel } from './creator-pick-package-view-model';

export interface CreatorPickGallery {
    coverUrl?: string;
    images?: string[];
    videoUrl?: string;
}

export interface CreatorPickFaqItem {
    q: string;
    a: string;
}

export class CreatorPickViewModel {
    id!: string | undefined;
    title!: string | undefined;
    shortPitch!: string | undefined;
    description!: string | undefined;       // legacy short description (kept)
    longDescription!: string | undefined;
    thumbnailUrl!: string | undefined;      // legacy — auto-synced from gallery.coverUrl
    gallery!: CreatorPickGallery | undefined;
    category!: CreatorPickCategoryEnum;
    tags!: string[];
    packages!: CreatorPickPackageViewModel[];
    faq!: CreatorPickFaqItem[];
    buyerRequirements!: string[];
    // Legacy fields kept writable so older mocks + consumers keep working.
    priceEur!: number;
    durationDays!: number;
    deliverables!: string[] | undefined;
    active!: boolean;
    salesCount!: number;
    rating!: number;


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorPickViewModel, {
                packages: { arrayOf: CreatorPickPackageViewModel },
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorPickViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorPickViewModel>(data, CreatorPickViewModel, {
            packages: { arrayOf: CreatorPickPackageViewModel },
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

// Helpers — used by cards and detail views so they can read derived fields
// regardless of whether the pick has packages or only legacy fields.

export function getPickPackages(pick: any): any[] {
    if (Array.isArray(pick?.packages) && pick.packages.length > 0) return pick.packages;
    return [];
}

export function getPickDisplayPrice(pick: any): number {
    const pkgs = getPickPackages(pick);
    if (pkgs.length > 0) {
        const prices = pkgs.map((p: any) => Number(p.priceEur) || 0).filter((n: number) => n > 0);
        if (prices.length > 0) return Math.min(...prices);
    }
    return Number(pick?.priceEur) || 0;
}

export function getPickCoverUrl(pick: any): string | undefined {
    return pick?.gallery?.coverUrl || pick?.thumbnailUrl || undefined;
}

export function getPickDeliveryDays(pick: any): number {
    const pkgs = getPickPackages(pick);
    if (pkgs.length > 0) return Number(pkgs[0].deliveryDays) || 0;
    return Number(pick?.durationDays) || 0;
}

// Sync legacy fields from the first/cheapest package + gallery before saving,
// so old consumers (cards, lists) keep rendering correctly.
export function syncLegacyPickFields(pick: any): any {
    const pkgs = getPickPackages(pick);
    if (pkgs.length > 0) {
        pick.priceEur = getPickDisplayPrice(pick);
        pick.durationDays = getPickDeliveryDays(pick);
        pick.deliverables = (pkgs[0].deliverables || [])
            .filter((d: any) => d?.included)
            .map((d: any) => d.quantity != null && d.quantity > 0 ? `${d.quantity} ${d.label.toLowerCase()}` : d.label);
    }
    if (pick?.gallery?.coverUrl && !pick.thumbnailUrl) {
        pick.thumbnailUrl = pick.gallery.coverUrl;
    }
    return pick;
}
