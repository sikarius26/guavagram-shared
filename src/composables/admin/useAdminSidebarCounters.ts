import { computed } from 'vue'
import { adminStore } from '~/services/apis/mocks/admin/_store'

export function useAdminSidebarCounters() {
  return {
    pendingReviews: computed(() =>
      adminStore.reviewQueue.filter(r => r.status === 'pending').length
    ),
    openDisputes: computed(() =>
      adminStore.disputes.filter(d =>
        d.status === 'open' || d.status === 'in_review' ||
        d.status === 'awaiting_creator' || d.status === 'awaiting_restaurant'
      ).length
    ),
    pendingEarnings: computed(() =>
      adminStore.earnings.filter(e => e.status === 'pending').length
    ),
    openReports: computed(() =>
      adminStore.reports.filter(r => r.status === 'open').length
    ),
  }
}
