/**
 * Minimal shared state for the professional profile displayed in the sidebar.
 * Mirrors the mocks from pages/professional-dashboard.vue; a real API-backed
 * composable can replace this once the profile endpoints land.
 */
export function useProfessionalProfile() {
  const handle = useState<string>('professional-handle', () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('dev_professional_handle') || 'tu-perfil'
    }
    return 'tu-perfil'
  })
  const avatarUrl = useState<string>('professional-avatar', () => '')
  const verifiedOverall = useState<boolean>('professional-verified', () => false)
  const completenessPct = useState<number>('professional-completeness', () => 45)

  return { handle, avatarUrl, verifiedOverall, completenessPct }
}
