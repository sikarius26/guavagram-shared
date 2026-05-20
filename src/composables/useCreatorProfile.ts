/**
 * Minimal shared creator profile state exposed to the layout sidebar.
 * Replace with a real useCurrentCreator backed by the API when available.
 */
export function useCreatorProfile() {
  const handle = useState<string>('creator-handle', () => 'tu-handle')
  const displayName = useState<string>('creator-displayName', () => 'Tu Nombre')
  const avatarUrl = useState<string>('creator-avatar', () => '')
  const level = useState<number>('creator-level', () => 0)
  const publicUrl = useState<string>('creator-publicUrl', () => '')
  return { handle, displayName, avatarUrl, level, publicUrl }
}
