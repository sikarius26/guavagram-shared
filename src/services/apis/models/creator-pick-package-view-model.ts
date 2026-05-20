import { dynamicFromJS, dynamicToJSON } from '../api.client.shared';

export const CREATOR_PICK_TIERS = ['BASIC', 'STANDARD', 'PREMIUM'] as const;
export type CreatorPickTier = typeof CREATOR_PICK_TIERS[number];

export const TIER_LABELS: Record<CreatorPickTier, string> = {
    BASIC: 'Básico',
    STANDARD: 'Recomendado',
    PREMIUM: 'Premium',
};

export const TIER_ORDER: Record<CreatorPickTier, number> = {
    BASIC: 0,
    STANDARD: 1,
    PREMIUM: 2,
};

// Canonical list of deliverables a pick package may include. `quantityUnit` is
// purely cosmetic — drives the helper text next to the quantity field.
export const PICK_DELIVERABLE_CATALOG: {
    key: string;
    label: string;
    quantityUnit?: string;
    hasQuantity: boolean;
}[] = [
    { key: 'stories',   label: 'Stories',                       hasQuantity: true,  quantityUnit: 'nº' },
    { key: 'reels',     label: 'Reel / vídeo corto',            hasQuantity: true,  quantityUnit: 'nº' },
    { key: 'posts',     label: 'Post en feed',                  hasQuantity: true,  quantityUnit: 'nº' },
    { key: 'bio',       label: 'Mención en bio',                hasQuantity: true,  quantityUnit: 'días' },
    { key: 'highlight', label: 'Destacado permanente',          hasQuantity: false },
    { key: 'dofollow',  label: 'Link dofollow en perfil',       hasQuantity: false },
    { key: 'repost',    label: 'Repost en cuenta secundaria',   hasQuantity: false },
];

export interface CreatorPickPackageDeliverable {
    key: string;
    label: string;
    quantity?: number;
    included: boolean;
}

export class CreatorPickPackageViewModel {
    tier!: CreatorPickTier;
    name!: string | undefined;
    description!: string | undefined;
    priceEur!: number;
    deliveryDays!: number;
    revisions!: number;
    deliverables!: CreatorPickPackageDeliverable[];


    init(_data?: any, _mappings?: any) {
        if (_data) {
            const mapped = dynamicFromJS(_data, CreatorPickPackageViewModel, {
            });
            Object.assign(this, mapped);
        }
    }

    static fromJS(
        data: any, _mappings?: any
    ): CreatorPickPackageViewModel {
        data = typeof data === 'object' ? data : {};
        return dynamicFromJS<CreatorPickPackageViewModel>(data, CreatorPickPackageViewModel, {
        });
    }

    toJSON() {
        return dynamicToJSON(this);
    }
}

// Build a blank package for a given tier with sensible defaults.
export function emptyPickPackage(tier: CreatorPickTier): CreatorPickPackageViewModel {
    const p = new CreatorPickPackageViewModel();
    p.tier = tier;
    p.name = TIER_LABELS[tier];
    p.description = '';
    p.priceEur = tier === 'BASIC' ? 60 : tier === 'STANDARD' ? 180 : 380;
    p.deliveryDays = tier === 'BASIC' ? 3 : tier === 'STANDARD' ? 5 : 7;
    p.revisions = tier === 'BASIC' ? 1 : tier === 'STANDARD' ? 2 : 3;
    p.deliverables = PICK_DELIVERABLE_CATALOG.map(d => ({
        key: d.key,
        label: d.label,
        quantity: d.hasQuantity ? 0 : undefined,
        included: false,
    }));
    return p;
}
