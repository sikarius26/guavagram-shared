import { ref, computed } from 'vue'
import type { DashboardCatalogViewModel } from '~/services/apis/models/dashboard-catalog-view-model'
import type { DashboardCatalogCategory } from '~/services/apis/models/dashboard-catalog-category'
import type { DashboardCatalogItem } from '~/services/apis/models/dashboard-catalog-item'

// Module-level singleton: shared across MenuPanel and GuavagramPanel
const catalog = ref<DashboardCatalogViewModel | null>(null)
const featuredIds = ref<Set<string>>(new Set())

export function useCatalog() {
  const setCatalog = (vm: DashboardCatalogViewModel | null) => { catalog.value = vm }

  const allItems = computed<DashboardCatalogItem[]>(() => {
    if (!catalog.value?.categories) return []
    return catalog.value.categories.flatMap(c => c.items || [])
  })

  const featuredItems = computed<DashboardCatalogItem[]>(() => {
    if (featuredIds.value.size === 0) return allItems.value.slice(0, 3)
    return allItems.value.filter(i => i.id && featuredIds.value.has(i.id))
  })

  const isFeatured = (id: string | undefined) => !!id && featuredIds.value.has(id)

  const toggleFeatured = (id: string | undefined) => {
    if (!id) return
    const next = new Set(featuredIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    featuredIds.value = next
  }

  // ─── 2-level hierarchy helpers ─────────────────────────────────────────────
  // Top-level categories (parentCategoryId is null/undefined). These drive the
  // dashboard category list at root; subcategories render indented underneath.
  const topLevelCategories = computed<DashboardCatalogCategory[]>(() =>
    (catalog.value?.categories ?? []).filter(c => !c.parentCategoryId)
  )

  // All immediate children of a given parent category id.
  const subcategoriesOf = (parentId: string | undefined): DashboardCatalogCategory[] => {
    if (!parentId || !catalog.value?.categories) return []
    return catalog.value.categories.filter(c => c.parentCategoryId === parentId)
  }

  // True if a category has at least one subcategory underneath it.
  const hasSubcategories = (categoryId: string | undefined): boolean =>
    !!categoryId && (catalog.value?.categories ?? []).some(c => c.parentCategoryId === categoryId)

  // Returns "Parent · Subcategory" when the item lives in a subcategory, else just the category name.
  // Useful as a breadcrumb-style label in the editor.
  const categoryNameOf = (itemId: string | undefined): string => {
    if (!itemId || !catalog.value?.categories) return ''
    for (const c of catalog.value.categories) {
      if (c.items?.some(i => i.id === itemId)) {
        if (c.parentCategoryId) {
          const parent = catalog.value.categories.find(p => p.id === c.parentCategoryId)
          return parent?.name ? `${parent.name} · ${c.name || ''}` : (c.name || '')
        }
        return c.name || ''
      }
    }
    return ''
  }

  return {
    catalog, allItems, featuredItems, featuredIds, isFeatured, toggleFeatured, setCatalog, categoryNameOf,
    topLevelCategories, subcategoriesOf, hasSubcategories,
  }
}
