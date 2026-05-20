export type ChallengeStatus = 'draft' | 'active' | 'paused' | 'ended'

export interface AdminChallenge {
  id: string
  name: string
  description: string
  status: ChallengeStatus
  rewardGp: number
  startAt: string
  endAt?: string
  requirements: string
  completedCount: number
}
