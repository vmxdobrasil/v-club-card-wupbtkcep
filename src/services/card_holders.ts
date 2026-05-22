import pb from '@/lib/pocketbase/client'

export type CardHolder = {
  id: string
  user_id: string
  company_id: string
  card_number?: string
  cvv?: string
  expiry?: string
  total_limit: number
  used_limit: number
  max_consigned_margin?: number
  status: 'active' | 'blocked' | 'canceled'
  created: string
  updated: string
}

export const getCardHolders = () =>
  pb.collection('card_holders').getFullList<CardHolder>({ sort: '-created' })
